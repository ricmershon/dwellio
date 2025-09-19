import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

interface MockSession {
    user?: {
        id?: string
        email?: string | null
        name?: string | null
        image?: string | null
    }
    expires: string
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    session?: MockSession | null
}

const AllProviders = ({ children, session }: { children: React.ReactNode; session?: MockSession | null }) => {
    return (
        <SessionProvider session={session as any}>
            {children}
        </SessionProvider>
    )
}

export const customRender = (
    ui: ReactElement,
    { session = null, ...renderOptions }: CustomRenderOptions = {}
) => {
    return render(ui, {
        wrapper: ({ children }) => <AllProviders session={session}>{children}</AllProviders>,
        ...renderOptions,
    })
}

export const createMockUser = (overrides = {}) => ({
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides
})

export const createMockSession = (userOverrides = {}) => ({
    user: createMockUser(userOverrides),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
})

export const createMockProperty = (overrides = {}) => ({
    _id: 'mock-property-id',
    title: 'Test Property',
    type: 'Apartment',
    description: 'A beautiful test property',
    location: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipcode: '12345'
    },
    beds: 2,
    baths: 1,
    square_feet: 1000,
    amenities: ['WiFi', 'Parking'],
    rates: {
        nightly: 100,
        weekly: 600,
        monthly: 2000
    },
    seller_info: {
        name: 'Test Seller',
        email: 'seller@example.com',
        phone: '555-0123'
    },
    owner: 'mock-owner-id',
    images: ['image1.jpg', 'image2.jpg'],
    is_featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
})

export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))