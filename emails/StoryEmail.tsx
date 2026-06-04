import {
  Html, Head, Body, Container, Text, Link, Hr, Preview
} from '@react-email/components'

interface StoryEmailProps {
  childName: string
  storyTitle: string
  storyBody: string
  preferencesUrl: string
  pauseUrl: string
  unsubUrl: string
  moodBaseUrl: string
}

// Near-plain-text template — designed for Gmail Primary placement
// No hero images, no background colors, no embedded web fonts
// Georgia system serif only — decorative HTML = Promotions tab
export function StoryEmail({
  childName,
  storyTitle,
  storyBody,
  preferencesUrl,
  pauseUrl,
  unsubUrl,
  moodBaseUrl
}: StoryEmailProps) {
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <Html lang="en">
      <Head />
      <Preview>{childName} is going to love this one.</Preview>
      <Body style={{ backgroundColor: '#ffffff', margin: '0', padding: '0' }}>
        <Container style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '40px 24px',
          fontFamily: 'Georgia, "Times New Roman", serif'
        }}>

          {/* Sender context — plain text feel */}
          <Text style={{
            fontSize: '14px',
            color: '#999999',
            margin: '0 0 8px 0',
            fontFamily: 'Georgia, serif'
          }}>
            A story for {childName}, {dayOfWeek} evening
          </Text>

          {/* Story title — the one flourish */}
          <Text style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#E8A838',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.3',
            margin: '0 0 32px 0'
          }}>
            {storyTitle}
          </Text>

          {/* Story body — paragraphs */}
          {storyBody.split('\n\n').filter(Boolean).map((paragraph, i) => (
            <Text key={i} style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#2C2A26',
              fontFamily: 'Georgia, serif',
              margin: '0 0 20px 0'
            }}>
              {paragraph}
            </Text>
          ))}

          {/* Story close */}
          <Text style={{
            textAlign: 'center' as const,
            color: '#cccccc',
            fontSize: '18px',
            margin: '32px 0 6px 0'
          }}>
            ✦
          </Text>
          <Text style={{
            textAlign: 'center' as const,
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: '#cccccc',
            margin: '0 0 40px 0',
            fontFamily: 'Georgia, serif'
          }}>
            {storyTitle}
          </Text>

          {/* Mood selector — one-tap for next story */}
          <Text style={{
            fontSize: '13px',
            color: '#888888',
            textAlign: 'center' as const,
            margin: '0 0 8px 0',
            fontFamily: 'Arial, sans-serif'
          }}>
            How is {childName} feeling tonight?
          </Text>
          <Text style={{
            fontSize: '20px',
            textAlign: 'center' as const,
            margin: '0 0 32px 0',
            lineHeight: '1.8'
          }}>
            <Link href={`${moodBaseUrl}&mood=happy`} style={{ textDecoration: 'none', marginRight: '8px' }}>😄</Link>
            <Link href={`${moodBaseUrl}&mood=sleepy`} style={{ textDecoration: 'none', marginRight: '8px' }}>😴</Link>
            <Link href={`${moodBaseUrl}&mood=silly`} style={{ textDecoration: 'none', marginRight: '8px' }}>🤪</Link>
            <Link href={`${moodBaseUrl}&mood=excited`} style={{ textDecoration: 'none', marginRight: '8px' }}>🤩</Link>
            <Link href={`${moodBaseUrl}&mood=anxious`} style={{ textDecoration: 'none' }}>🤗</Link>
          </Text>

          {/* Footer — 3 lines only */}
          <Hr style={{ borderColor: '#eeeeee', margin: '0 0 20px 0' }} />
          <Text style={{
            fontSize: '12px',
            color: '#aaaaaa',
            lineHeight: '2.2',
            margin: '0',
            fontFamily: 'Arial, sans-serif'
          }}>
            <Link href={preferencesUrl} style={{ color: '#aaaaaa', textDecoration: 'underline' }}>
              Change {childName}&apos;s preferences
            </Link>
            {' · '}
            <Link href={pauseUrl} style={{ color: '#aaaaaa', textDecoration: 'underline' }}>
              Pause stories for a week
            </Link>
            {' · '}
            <Link href={unsubUrl} style={{ color: '#aaaaaa', textDecoration: 'underline' }}>
              Unsubscribe
            </Link>
          </Text>

        </Container>
      </Body>
    </Html>
  )
}

export default StoryEmail
