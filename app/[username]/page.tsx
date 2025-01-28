import StatsPage from "@/components/stats-page"
import { fetchGitHubStats } from "@/lib/actions/github-actions"
import { 
  generateTags, 
  generateTopContributions, 
  generateHighlights, 
  generateProgrammerArchtype,
  generateNextProject,
  generateAchillesHeel
} from "@/lib/actions/ai-actions"
import { auth } from "@/lib/auth"

interface Props {
  params: {
    username: string
  }
}

export default async function UserPage({ params }: Props) {
  try {
    const session = await auth()
    const isAuthenticated = !!session
    
    const stats = await fetchGitHubStats(params.username, isAuthenticated)
    
    // Fetch all AI-generated content in parallel
    const [tags, topContributions, highlights, archetype, nextProject, achillesHeel] = await Promise.all([
      generateTags(stats.bio, stats.topRepositories),
      generateTopContributions(stats.topRepositories),
      generateHighlights(stats, stats.topRepositories),
      generateProgrammerArchtype(stats, stats.topRepositories),
      generateNextProject(stats, stats.topRepositories),
      generateAchillesHeel(stats, stats.topRepositories)
    ])

    return <StatsPage 
      username={params.username} 
      stats={stats} 
      tags={tags}
      topContributions={topContributions}
      highlights={highlights}
      archetype={archetype as any}
      nextProject={nextProject}
      achillesHeel={achillesHeel}
    />
  } catch (error) {
    // Handle authentication and other errors gracefully
    console.error('Error in UserPage:', error)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-400 mb-6">
            {error instanceof Error ? error.message : 'Unable to load GitHub stats'}
          </p>
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm transition-all duration-200"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }
}
