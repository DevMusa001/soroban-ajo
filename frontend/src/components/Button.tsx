'use client'

import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useRipple } from '../hooks/useRipple'
import { Ripple } from './animations/Ripple'
import { useMotionPreference } from '../hooks/useMotionPreference'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const MotionButton = motion.button

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const reducedMotion = useMotionPreference()
    const { ripples, createRipple } = useRipple({ disabled: disabled || isLoading })

    const baseStyles =
      'relative inline-flex items-center justify-center font-medium rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(e)
      onClick?.(e)
    }

    return (
      <MotionButton
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        onClick={handleClick}
        whileHover={reducedMotion ? undefined : { scale: 1.02 }}
        whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {isLoading && (
          <motion.svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </motion.svg>
        )}
        {!isLoading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        <Ripple ripples={ripples} />
      </MotionButton>
    )
  }
)

Button.displayName = 'Button'
