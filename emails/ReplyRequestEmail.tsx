import { Html, Head, Body, Container, Text, Preview } from '@react-email/components'

// Day 2 email — engineers a reply which moves us out of Promotions permanently
// Plain text only — this email is from a person
interface ReplyRequestEmailProps {
  childName: string
  storyTitle: string
}

export function ReplyRequestEmail({ childName, storyTitle }: ReplyRequestEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Did {childName} enjoy the story?</Preview>
      <Body style={{ backgroundColor: '#ffffff', margin: '0', padding: '0' }}>
        <Container style={{
          maxWidth: '560px',
          margin: '0 auto',
          padding: '40px 24px',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          <Text style={{ fontSize: '16px', lineHeight: '1.7', color: '#333333', margin: '0 0 16px 0' }}>
            Hi,
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '1.7', color: '#333333', margin: '0 0 16px 0' }}>
            I wanted to check in. Did {childName} enjoy &quot;{storyTitle}&quot; last night?
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '1.7', color: '#333333', margin: '0 0 16px 0' }}>
            I&apos;m always curious what kids actually think — a word or two is plenty.
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '1.7', color: '#333333', margin: '0 0 32px 0' }}>
            Hit reply and let me know.
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '1.7', color: '#333333', margin: '0' }}>
            — Maya
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ReplyRequestEmail
