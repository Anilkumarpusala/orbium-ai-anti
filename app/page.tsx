import Link from 'next/link'

export default function Page() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontFamily: 'var(--font-syne), sans-serif',
        fontSize: '4rem',
        marginBottom: '1rem',
        background: 'linear-gradient(90deg, #FFFFFF, #888888)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Orbium AI
      </h1>
      
      <p style={{
        fontSize: '1.2rem',
        color: '#A0A0A0',
        maxWidth: '600px',
        marginBottom: '3rem',
        lineHeight: 1.6
      }}>
        The next generation AI platform. 
        Your development environment is successfully running.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link 
          href="/login" 
          style={{
            padding: '0.8rem 2rem',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-jetbrains), monospace',
            transition: 'opacity 0.2s'
          }}
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}
