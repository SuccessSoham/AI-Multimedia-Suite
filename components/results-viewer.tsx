import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Eye, BarChart3, ImageIcon, Music, Type, FileJson, Trash2 } from "lucide-react"
import type { ProcessingJob } from "@/app/page"
import { toast } from "sonner"
import { deleteJobFromVault } from "@/lib/vault"

interface ResultsViewerProps {
  jobs: ProcessingJob[]
}

export function ResultsViewer({ jobs }: ResultsViewerProps) {
  const downloadFile = (dataUrl: string, filename: string) => {
    if (!dataUrl || typeof dataUrl !== 'string' || dataUrl.includes("error")) return
    try {
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Downloaded: ${filename}`)
    } catch (e) {
      toast.error("Download failed")
    }
  }

  const exportJobData = (job: ProcessingJob) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(job, null, 2))
    downloadFile(dataStr, `suit-export-${job.id}.json`)
  }

  const clearVault = async () => {
    if (confirm("Are you sure you want to clear all saved generations? This cannot be undone.")) {
      for (const job of jobs) {
        await deleteJobFromVault(job.id)
      }
      window.location.reload()
    }
  }

  const renderResults = (results: any, agentType: string, jobId: string) => {
    if (!results || typeof results !== 'object') {
      return <p className="text-slate-500 font-mono text-xs italic">No data available for this sector</p>
    }

    if (agentType === "creative") {
      const creativeData = results.assets || results
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Result */}
            <Card className="bg-white/5 border-white/10 overflow-hidden group">
              <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-400">
                  <ImageIcon className="w-4 h-4" />
                  Synthesized Image
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">{creativeData?.image?.model || "IMAGE ENGINE"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 aspect-square bg-slate-900 flex items-center justify-center relative">
                {creativeData?.image?.error ? (
                  <div className="p-6 text-center">
                    <p className="text-red-400 text-xs font-mono">{creativeData.image.error}</p>
                  </div>
                ) : creativeData?.image?.url ? (
                  <>
                    <img 
                      src={creativeData.image.url} 
                      alt="Generated Asset" 
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity cursor-zoom-in"
                      onClick={() => window.open(creativeData.image.url, '_blank')}
                    />
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button size="sm" variant="secondary" className="h-8 gap-2 bg-black/60 backdrop-blur text-[10px] font-bold" onClick={() => downloadFile(creativeData.image.url, `suit-image-${jobId}.jpg`)}>
                          <Download className="w-3 h-3" /> SAVE JPG
                       </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-600 text-xs font-mono">IMAGE DATA NOT FOUND</p>
                )}
              </CardContent>
            </Card>

            {/* Audio Result */}
            <Card className="bg-white/5 border-white/10 overflow-hidden group">
              <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-400">
                  <Music className="w-4 h-4" />
                  Generated Audio
                </CardTitle>
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className="text-[10px] uppercase">{creativeData?.audio?.model || "AUDIO ENGINE"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center justify-center gap-4 bg-slate-900/50 h-full">
                {creativeData?.audio?.error ? (
                   <div className="text-center py-4">
                     <p className="text-amber-400 text-xs font-mono">{creativeData.audio.error}</p>
                   </div>
                ) : creativeData?.audio?.url ? (
                  <>
                    <div className="w-full h-12 bg-purple-500/20 rounded-lg flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center justify-around px-4 opacity-50">
                        {[...Array(20)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-1 bg-purple-400 rounded-full animate-pulse" 
                            style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s` }} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 z-10 uppercase tracking-widest">Waveform Analysis...</span>
                    </div>
                    <audio controls className="w-full h-8 brightness-90 contrast-125" src={creativeData.audio.url} />
                    <Button 
                      className="w-full h-9 gap-2 text-xs font-bold uppercase tracking-widest bg-purple-600 hover:bg-purple-500"
                      onClick={() => downloadFile(creativeData.audio.url, `suit-audio-${jobId}.mp3`)}
                    >
                      <Download className="w-4 h-4" /> Download Soundtrack
                    </Button>
                  </>
                ) : (
                  <p className="text-slate-600 text-xs font-mono">AUDIO DATA NOT FOUND</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Result */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-400">
                <Type className="w-4 h-4" />
                Creative Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="p-3 bg-black/30 rounded-lg border border-white/5 italic text-sm text-slate-300 leading-relaxed">
                  "{creativeData?.analysis?.transcription || "No analysis data found"}"
                </div>
                <div className="flex flex-wrap gap-2">
                  {creativeData?.analysis?.keywords?.map((kw: string) => (
                    <Badge key={kw} variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                      {kw}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="ml-auto text-[10px] font-mono opacity-50 uppercase">
                    Mood: {creativeData?.analysis?.sentiment || "Unknown"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-white/5 rounded border border-transparent dark:border-white/5">
            <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">{String(value)}</span>
          </div>
        ))}
      </div>
    )
  }

  const getAgentName = (agentId: string) => {
    const names: Record<string, string> = {
      "video-agent": "Video Enhancement",
      "audio-agent": "Audio Optimization",
      "storyboard-agent": "Storyboard Generation",
      "metadata-agent": "Metadata Extraction",
      "creative-agent": "Creative Pulse",
    }
    return names[agentId] || agentId
  }

  const getAgentColor = (agentId: string) => {
    const colors: Record<string, string> = {
      "video-agent": "bg-green-500/10 text-green-500 border-green-500/20",
      "audio-agent": "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "storyboard-agent": "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "metadata-agent": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "creative-agent": "bg-primary/10 text-primary border-primary/20",
    }
    return colors[agentId] || "bg-slate-500/10 text-slate-500 border-slate-500/20"
  }

  return (
    <div className="space-y-6">
      <Card className="bg-background/50 backdrop-blur-xl border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight text-white uppercase">Result Vault</CardTitle>
              <CardDescription className="text-slate-400 font-mono text-xs mt-1">SECURE LOCAL ENCRYPTED STORAGE (INDEXEDDB)</CardDescription>
            </div>
            <div className="flex gap-4">
               {jobs.length > 0 && (
                 <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2" onClick={clearVault}>
                    <Trash2 className="w-4 h-4" /> CLEAR ALL
                 </Button>
               )}
               <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 SYSTEM SYNCHRONIZED
               </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
              <FileJson className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <div className="text-slate-500 font-mono text-sm">NO GENERATED ASSETS DETECTED IN LOCAL HUB</div>
              <p className="text-slate-600 text-xs mt-2 uppercase tracking-widest">Awaiting creative pulse invocation...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.id} className="bg-black/20 border-white/5 hover:border-primary/30 transition-colors overflow-hidden">
                  <CardHeader className="bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg text-white font-bold">{job.fileName}</CardTitle>
                        <CardDescription className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          {new Date().toLocaleTimeString()} • {job.id} • {job.fileType}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white/5 border-white/10 hover:bg-primary/20 text-xs gap-2"
                          onClick={() => exportJobData(job)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          EXPORT RAW JSON
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue={job.agents.includes("creative-agent") ? "creative" : "overview"} className="w-full">
                      <TabsList className="w-full justify-start bg-transparent border-b border-white/5 rounded-none px-4 h-11 gap-4">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 h-full text-xs font-bold uppercase tracking-widest">Overview</TabsTrigger>
                        {job.agents.includes("creative-agent") && (
                          <TabsTrigger value="creative" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 h-full text-xs font-bold uppercase tracking-widest">Creative Pulse</TabsTrigger>
                        )}
                        {job.results["video-agent"] && <TabsTrigger value="video" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 h-full text-xs font-bold uppercase tracking-widest">Video</TabsTrigger>}
                        {job.results["audio-agent"] && <TabsTrigger value="audio" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 h-full text-xs font-bold uppercase tracking-widest">Audio</TabsTrigger>}
                        {job.results["storyboard-agent"] && <TabsTrigger value="storyboard" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 h-full text-xs font-bold uppercase tracking-widest">Storyboard</TabsTrigger>}
                        {job.results["metadata-agent"] && <TabsTrigger value="metadata" className="data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 h-full text-xs font-bold uppercase tracking-widest">Metadata</TabsTrigger>}
                      </TabsList>

                      <div className="p-6">
                        <TabsContent value="overview" className="mt-0 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(job.results).map(([agentId, results]) => (
                              <Card key={agentId} className="bg-white/5 border-white/10">
                                <CardHeader className="pb-2">
                                  <Badge className={`w-fit font-bold tracking-widest text-[9px] uppercase ${getAgentColor(agentId)}`}>
                                    {getAgentName(agentId)}
                                  </Badge>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center space-x-2">
                                    <BarChart3 className="h-4 w-4 text-slate-500" />
                                    <span className="text-xs text-slate-400 font-mono">{results ? Object.keys(results).length : 0} METRICS EXTRACTED</span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="creative" className="mt-0">
                          {renderResults(job.results["creative-agent"], "creative", job.id)}
                        </TabsContent>

                        <TabsContent value="video" className="mt-0">
                          {renderResults(job.results["video-agent"], "video", job.id)}
                        </TabsContent>

                        <TabsContent value="audio" className="mt-0">
                          {renderResults(job.results["audio-agent"], "audio", job.id)}
                        </TabsContent>

                        <TabsContent value="storyboard" className="mt-0">
                          {renderResults(job.results["storyboard-agent"], "storyboard", job.id)}
                        </TabsContent>

                        <TabsContent value="metadata" className="mt-0">
                          {renderResults(job.results["metadata-agent"], "metadata", job.id)}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



