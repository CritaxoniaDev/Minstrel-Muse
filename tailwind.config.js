const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
		"./index.html",
	],
	theme: {
    	extend: {
    		fontFamily: {
    			sans: [
    				'Inter',
                    ...defaultTheme.fontFamily.sans
                ]
    		},
    		keyframes: {
    			'slide-in-right': {
    				'0%': {
    					transform: 'translateX(100%)'
    				},
    				'100%': {
    					transform: 'translateX(0)'
    				}
    			},
    			gradient: {
    				'0%, 100%': {
    					backgroundPosition: '0% 50%'
    				},
    				'50%': {
    					backgroundPosition: '100% 50%'
    				}
    			},
    			marquee: {
    				'0%': {
    					transform: 'translateX(0%)'
    				},
    				'100%': {
    					transform: 'translateX(-100%)'
    				}
    			},
    			'slide-up': {
    				'0%': {
    					transform: 'translateY(100%)'
    				},
    				'100%': {
    					transform: 'translateY(0)'
    				}
    			},
    			'grid-fade-in': {
    				'0%': {
    					opacity: '0'
    				},
    				'100%': {
    					opacity: '1'
    				}
    			},
    			'grid-slide-horizontal': {
    				'0%': {
    					transform: 'translateX(0)'
    				},
    				'100%': {
    					transform: 'translateX(14px)'
    				}
    			},
    			'grid-slide-vertical': {
    				'0%': {
    					transform: 'translateY(0)'
    				},
    				'100%': {
    					transform: 'translateY(24px)'
    				}
    			},
    			'grid-beam': {
    				'0%': {
    					transform: 'translateX(-100%) translateY(-100%)',
    					opacity: 0
    				},
    				'50%': {
    					opacity: 1
    				},
    				'100%': {
    					transform: 'translateX(100%) translateY(100%)',
    					opacity: 0
    				}
    			},
    			'grid-beam-horizontal': {
    				'0%': {
    					transform: 'translateX(-200%)',
    					opacity: 0
    				},
    				'50%': {
    					opacity: 1
    				},
    				'100%': {
    					transform: 'translateX(200%)',
    					opacity: 0
    				}
    			},
    			'grid-beam-vertical': {
    				'0%': {
    					transform: 'translateY(-200%)',
    					opacity: 0
    				},
    				'50%': {
    					opacity: 1
    				},
    				'100%': {
    					transform: 'translateY(200%)',
    					opacity: 0
    				}
    			},
    			'gradient-x': {
    				'0%, 100%': {
    					'background-size': '200% 200%',
    					'background-position': 'left center'
    				},
    				'50%': {
    					'background-size': '200% 200%',
    					'background-position': 'right center'
    				}
    			},
    			'aurora-border': {
    				'0%, 100%': {
    					borderRadius: '37% 29% 27% 27% / 28% 25% 41% 37%'
    				},
    				'25%': {
    					borderRadius: '47% 29% 39% 49% / 61% 19% 66% 26%'
    				},
    				'50%': {
    					borderRadius: '57% 23% 47% 72% / 63% 17% 66% 33%'
    				},
    				'75%': {
    					borderRadius: '28% 49% 29% 100% / 93% 20% 64% 25%'
    				}
    			},
    			'aurora-1': {
    				'0%, 100%': {
    					top: '0',
    					right: '0'
    				},
    				'50%': {
    					top: '50%',
    					right: '25%'
    				},
    				'75%': {
    					top: '25%',
    					right: '50%'
    				}
    			},
    			'aurora-2': {
    				'0%, 100%': {
    					top: '0',
    					left: '0'
    				},
    				'60%': {
    					top: '75%',
    					left: '25%'
    				},
    				'85%': {
    					top: '50%',
    					left: '50%'
    				}
    			},
    			'aurora-3': {
    				'0%, 100%': {
    					bottom: '0',
    					left: '0'
    				},
    				'40%': {
    					bottom: '50%',
    					left: '25%'
    				},
    				'65%': {
    					bottom: '25%',
    					left: '50%'
    				}
    			},
    			'aurora-4': {
    				'0%, 100%': {
    					bottom: '0',
    					right: '0'
    				},
    				'50%': {
    					bottom: '25%',
    					right: '40%'
    				},
    				'90%': {
    					bottom: '50%',
    					right: '25%'
    				}
    			},
    			orbit: {
    				'0%': {
    					transform: 'rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg))'
    				},
    				'100%': {
    					transform: 'rotate(calc(var(--angle) * 1deg + 360deg)) translateY(calc(var(--radius) * 1px)) rotate(calc((var(--angle) * -1deg) - 360deg))'
    				}
    			}
    		},
    		scale: {
    			'102': '1.02'
    		},
    		animation: {
    			marquee: 'marquee 15s linear infinite',
    			'slide-in-right': 'slide-in-right 0.3s ease-out',
    			'slide-up': 'slide-up 0.3s ease-out',
    			'grid-fade-in': 'grid-fade-in 2s ease-out forwards',
    			'gradient-very-slow': 'gradient 8s linear infinite',
    			'grid-beam': 'grid-beam 3s linear infinite',
    			'grid-beam-horizontal': 'grid-beam-horizontal 8s linear infinite',
    			'grid-beam-vertical': 'grid-beam-vertical 8s linear infinite',
    			'grid-slide-horizontal': 'grid-slide-horizontal 20s linear infinite',
    			'grid-slide-vertical': 'grid-slide-vertical 20s linear infinite',
    			'gradient-shift': 'gradient 8s ease infinite',
    			orbit: 'orbit calc(var(--duration)*1s) linear infinite'
    		},
    		'gradient-x': 'gradient-x 15s ease infinite',
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			'color-1': 'hsl(var(--color-1))',
    			'color-2': 'hsl(var(--color-2))',
    			'color-3': 'hsl(var(--color-3))',
    			'color-4': 'hsl(var(--color-4))',
    			'color-5': 'hsl(var(--color-5))'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate"), require('tailwind-scrollbar')],

}
