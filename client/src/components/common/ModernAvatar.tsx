import React, { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import { adventurer, avataaars, openPeeps } from '@dicebear/collection'

interface ModernAvatarProps {
    name: string
    size?: number
    style?: 'adventurer' | 'avataaars' | 'openPeeps'
}

const ModernAvatar: React.FC<ModernAvatarProps> = ({ name, size = 40, style = 'adventurer' }) => {
    // Generate avatar SVG using DiceBear
    const avatarSvg = useMemo(() => {
        // Generate a hash from name for consistent avatar
        const generateSeed = (str: string): string => {
            let hash = 0
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i)
                hash = ((hash << 5) - hash) + char
                hash = hash & hash
            }
            return Math.abs(hash).toString()
        }

        const seed = generateSeed(name)
        
        try {
            let avatar
            
            // Create avatar based on style with simplified options
            if (style === 'adventurer') {
                avatar = createAvatar(adventurer, {
                    seed,
                    size,
                    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
                })
            } else if (style === 'avataaars') {
                avatar = createAvatar(avataaars, {
                    seed,
                    size,
                    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
                })
            } else {
                avatar = createAvatar(openPeeps, {
                    seed,
                    size,
                    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
                })
            }

            return avatar.toString()
        } catch (error) {
            console.error('Error generating avatar:', error)
            return ''
        }
    }, [name, size, style])

    // Convert SVG string to data URL
    const avatarDataUrl = useMemo(() => {
        const encodedSvg = encodeURIComponent(avatarSvg)
        return `data:image/svg+xml,${encodedSvg}`
    }, [avatarSvg])

    return (
        <div 
            className="vscode-modern-avatar"
            style={{
                width: size,
                height: size,
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0'
            }}
        >
            <img 
                src={avatarDataUrl}
                alt={`Avatar for ${name}`}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
                onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                        parent.innerHTML = `
                            <div style="
                                width: 100%;
                                height: 100%;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: 600;
                                font-size: ${size * 0.4}px;
                            ">
                                ${name.charAt(0).toUpperCase()}
                            </div>
                        `
                    }
                }}
            />
        </div>
    )
}

export { ModernAvatar }
export default ModernAvatar
