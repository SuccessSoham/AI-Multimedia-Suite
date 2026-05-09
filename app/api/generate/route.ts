import { NextResponse } from "next/server"

const HF_TOKEN = process.env.HUGGING_FACE_API_KEY
const GROQ_TOKEN = process.env.GROQ_API_KEY

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!HF_TOKEN || !GROQ_TOKEN) {
      return NextResponse.json({ error: "API keys not configured. Check .env.local" }, { status: 500 })
    }

    // MULTI-MESH ROUTER: Orchestrating simultaneous asset generation
    // We use Promise.allSettled to allow partial success if one model is down
    const [imageResult, audioResult, analysisResult] = await Promise.allSettled([
      generateImage(prompt),
      generateAudio(prompt),
      analyzeIntent(prompt)
    ])

    const assets = {
      image: imageResult.status === 'fulfilled' ? imageResult.value : { error: (imageResult as any).reason?.message || "Image Gen Failed" },
      audio: audioResult.status === 'fulfilled' ? audioResult.value : { error: (audioResult as any).reason?.message || "Audio Gen Failed" },
      analysis: analysisResult.status === 'fulfilled' ? analysisResult.value : { sentiment: "Error", keywords: [], transcription: prompt }
    }

    return NextResponse.json({
      success: true,
      assets,
      metadata: {
        model_mesh: ["FLUX.1-schnell", "MusicGen-Melody", "Llama-3-70b"],
        timestamp: new Date().toISOString(),
        provider: "Hugging Face / Groq Hub"
      }
    })

  } catch (error: any) {
    console.error("Multi-Mesh Router Critical Error:", error)
    return NextResponse.json({ 
      error: "Creative synthesis pipeline failed",
      details: error.message
    }, { status: 500 })
  }
}

async function generateImage(prompt: string) {
  // Trying FLUX.1-schnell again with proper headers and error handling
  const modelId = "black-forest-labs/FLUX.1-schnell"
  
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${modelId}`,
    {
      headers: { 
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    }
  )

  if (!response.ok) {
    const status = response.status
    const text = await response.text()
    
    // If FLUX fails (e.g. 404/Cannot POST), fallback to SDXL
    if (status === 404 || text.includes("Cannot POST")) {
      console.warn("FLUX.1 failed/not found, falling back to SDXL...")
      return fallbackImageGen(prompt)
    }

    if (status === 503) throw new Error("Image model is loading. Try again in 20s.")
    throw new Error(`Image Generation Failed (${status})`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")
  
  return {
    url: `data:image/jpeg;base64,${base64}`,
    provider: "Hugging Face",
    model: modelId,
    dimensions: "1024x1024"
  }
}

async function fallbackImageGen(prompt: string) {
  const modelId = "stabilityai/stable-diffusion-xl-base-1.0"
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${modelId}`,
    {
      headers: { 
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    }
  )

  if (!response.ok) throw new Error(`Fallback Image Gen Failed (${response.status})`)

  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")
  
  return {
    url: `data:image/jpeg;base64,${base64}`,
    provider: "Hugging Face (Fallback)",
    model: modelId,
    dimensions: "1024x1024"
  }
}

async function generateAudio(prompt: string) {
  const audioPrompt = `High quality instrumental soundtrack, ${prompt}`
  const modelId = "facebook/musicgen-melody"
  
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${modelId}`,
    {
      headers: { 
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ inputs: audioPrompt }),
    }
  )

  if (!response.ok) {
    const status = response.status
    if (status === 503) return { url: "", error: "Audio model is loading. Please wait." }
    throw new Error(`Audio Generation Failed (${status})`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")
  
  return {
    url: `data:audio/mpeg;base64,${base64}`,
    provider: "Hugging Face",
    model: modelId,
    duration: "10s"
  }
}

async function analyzeIntent(prompt: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${GROQ_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are the JARVIS Creative Analyst. Analyze the user prompt and extract: 1. Sentiment mood. 2. Top 3 keywords. 3. A expanded description. Return JSON only: { \"sentiment\": string, \"keywords\": string[], \"transcription\": string }"
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    }),
  })

  if (!response.ok) throw new Error(`Groq Analysis Failed (${response.status})`)

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}
