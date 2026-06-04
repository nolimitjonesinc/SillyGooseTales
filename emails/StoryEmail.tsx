import {
  Html, Head, Body, Container, Text, Link, Button, Hr, Preview
} from '@react-email/components'

interface StoryEmailProps {
  childName: string
  storyTitle: string
  storyPreview: string
  storyPageUrl: string
  preferencesUrl: string
  pauseUrl: string
  unsubUrl: string
  moodBaseUrl: string
}

// Near-plain-text teaser — story hook + link to hosted story page
// No heavy HTML, no hero images — designed for Gmail Primary placement
export function StoryEmail({
  childName,
  storyTitle,
  storyPreview,
  storyPageUrl,
  preferencesUrl,
  pauseUrl,
  unsubUrl,
  moodBaseUrl
}: StoryEmailProps) {
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <Html lang="en">
      <Head />
      <Preview>{childName}&apos;s story just arrived. Tap to read.</Preview>
      <Body style={{ backgroundColor: '#ffffff', margin: '0', padding: '0' }}>
        <Container style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '40px 24px',
          fontFamily: 'Georgia, "Times New Roman", serif'
        }}>

          {/* Sender context */}
          <Text style={{
            fontSize: '14px',
            color: '#999999',
            margin: '0 0 8px 0',
            fontFamily: 'Georgia, serif'
          }}>
            A story for {childName}, {dayOfWeek} evening
          </Text>

          {/* Story title */}
          <Text style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#E8A838',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.3',
            margin: '0 0 28px 0'
          }}>
            {storyTitle}
          </Text>

          {/* Story preview — first 2 paragraphs */}
          {storyPreview.split('\n\n').filter(Boolean).map((paragraph, i) => (
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

          {/* Fade hint */}
          <Text style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: '#aaaaaa',
            fontFamily: 'Georgia, serif',
            margin: '0 0 32px 0',
            fontStyle: 'italic'
          }}>
            ...
          </Text>

          {/* CTA — the whole point of the email */}
          <Button
            href={storyPageUrl}
            style={{
              backgroundColor: '#E8A838',
              color: '#ffffff',
              fontFamily: 'Georgia, serif',
              fontSize: '17px',
              fontWeight: 'bold',
              textDecoration: 'none',
              padding: '14px 32px',
              borderRadius: '6px',
              display: 'inline-block',
              margin: '0 0 40px 0'
            }}
          >
            Read {childName}&apos;s full story →
          </Button>

          {/* Mood selector */}
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

          {/* Footer */}
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
