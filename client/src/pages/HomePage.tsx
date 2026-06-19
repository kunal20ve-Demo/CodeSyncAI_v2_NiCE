import illustration from "@/assets/illustration.svg"
import FormComponent from "@/components/forms/FormComponent"

function HomePage() {
    return (
        <div 
            style={{ 
                minHeight: '100vh',
                width: '100vw',
                position: 'fixed',
                top: 0,
                left: 0,
                backgroundColor: '#3a4553',
                backgroundImage: 'linear-gradient(135deg, #3a4553 0%, #2d3748 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                zIndex: 1000
            }}
        >
            {/* Main Container */}
            <div style={{ 
                width: '100%',
                maxWidth: '1200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4rem'
            }}>
                {/* Left Side - Illustration */}
                <div style={{ 
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        <img
                            src={illustration}
                            alt="Code Sync Illustration"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </div>
                </div>
                
                {/* Right Side - Login Form */}
                <div style={{ 
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FormComponent />
                </div>
            </div>
        </div>
    )
}

export default HomePage
