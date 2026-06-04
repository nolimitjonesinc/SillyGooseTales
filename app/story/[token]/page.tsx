import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PrintButton } from './PrintButton'
import { UpgradeSection } from './UpgradeSection'

interface Props {
  params: Promise<{ token: string }>
}

export default async function StoryPage({ params }: Props) {
  const { token } = await params

  const { data: story } = await supabaseAdmin
    .from('sillytales_story_queue')
    .select('story_title, story_body, illustration_url, subscriber_id')
    .eq('story_token', token)
    .single()

  if (!story) notFound()

  const { data: prefs } = await supabaseAdmin
    .from('sillytales_preferences')
    .select('child_name')
    .eq('subscriber_id', story.subscriber_id)
    .single()

  const { data: sub } = await supabaseAdmin
    .from('sillytales_subscribers')
    .select('subscription_status')
    .eq('id', story.subscriber_id)
    .single()

  const childName = prefs?.child_name ?? 'your little one'
  const isFree = sub?.subscription_status === 'free_trial'
  const paragraphs = story.story_body.split('\n\n').filter((p: string) => p.length > 0)

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div style={{
        backgroundColor: '#FFFDF8',
        minHeight: '100vh',
        padding: '0 0 80px 0'
      }}>
        <PrintButton />

        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '72px 32px 0'
        }}>

          {/* Illustration */}
          {story.illustration_url && (
            <img
              src={story.illustration_url}
              alt={`Illustration for ${story.story_title}`}
              style={{
                width: '100%',
                borderRadius: '12px',
                marginBottom: '56px',
                display: 'block'
              }}
            />
          )}

          {/* Child context */}
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#aaaaaa',
            margin: '0 0 12px 0',
            letterSpacing: '0.03em'
          }}>
            A story for {childName}
          </p>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#E8A838',
            lineHeight: '1.25',
            margin: '0 0 48px 0'
          }}>
            {story.story_title}
          </h1>

          {/* Story body */}
          {paragraphs.map((paragraph: string, i: number) => (
            <p key={i} style={{
              fontFamily: 'Georgia, serif',
              fontSize: '19px',
              lineHeight: '1.9',
              color: '#2C2A26',
              margin: '0 0 28px 0'
            }}>
              {paragraph}
            </p>
          ))}

          {/* End marker */}
          <p style={{
            textAlign: 'center',
            color: '#cccccc',
            fontSize: '20px',
            margin: '48px 0 6px 0'
          }}>
            ✦
          </p>
          <p style={{
            textAlign: 'center',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#cccccc',
            margin: '0 0 0 0',
            fontFamily: 'Georgia, serif'
          }}>
            {story.story_title}
          </p>

          {/* Upsell — free users only */}
          {isFree && (
            <UpgradeSection
              childName={childName}
              subscriberId={story.subscriber_id}
            />
          )}

        </div>
      </div>
    </>
  )
}

export const dynamic = 'force-dynamic'
