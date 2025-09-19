import { fetchStaticInputs } from '@/lib/data/static-inputs-data'
import dbConnect from '@/lib/db-connect'
import { StaticInputs } from '@/models'

jest.mock('@/lib/db-connect')
jest.mock('@/models')

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>
const mockStaticInputs = StaticInputs as jest.Mocked<typeof StaticInputs>

describe('Static Inputs Data', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        console.error = jest.fn()
    })

    describe('fetchStaticInputs', () => {
        const mockStaticInputsData = {
            amenities: ['WiFi', 'Parking', 'Pool', 'Gym'],
            property_types: ['Apartment', 'House', 'Condo', 'Townhouse']
        }

        it('should fetch static inputs successfully', async () => {
            mockDbConnect.mockResolvedValue({} as any)
            mockStaticInputs.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockStaticInputsData)
                })
            } as any)

            const result = await fetchStaticInputs()

            expect(mockDbConnect).toHaveBeenCalledTimes(1)
            expect(mockStaticInputs.findOne).toHaveBeenCalledWith()
            expect(result).toEqual(mockStaticInputsData)
        })

        it('should return default empty arrays when no data found', async () => {
            mockDbConnect.mockResolvedValue({} as any)
            mockStaticInputs.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                })
            } as any)

            const result = await fetchStaticInputs()

            expect(result).toEqual({
                amenities: [],
                property_types: []
            })
        })

        it('should handle database connection errors', async () => {
            const connectionError = new Error('Database connection failed')
            mockDbConnect.mockRejectedValue(connectionError)

            await expect(fetchStaticInputs()).rejects.toThrow(
                'Failed to fetch static inputs: Error: Database connection failed'
            )

            expect(console.error).toHaveBeenCalledWith(
                '>>> Database error fetching static inputs: Error: Database connection failed'
            )
        })

        it('should handle database query errors', async () => {
            const queryError = new Error('Query failed')
            mockDbConnect.mockResolvedValue({} as any)
            mockStaticInputs.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockRejectedValue(queryError)
                })
            } as any)

            await expect(fetchStaticInputs()).rejects.toThrow(
                'Failed to fetch static inputs: Error: Query failed'
            )

            expect(console.error).toHaveBeenCalledWith(
                '>>> Database error fetching static inputs: Error: Query failed'
            )
        })

        it('should handle partial data gracefully', async () => {
            const partialData = {
                amenities: ['WiFi', 'Parking']
                // property_types missing
            }

            mockDbConnect.mockResolvedValue({} as any)
            mockStaticInputs.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(partialData)
                })
            } as any)

            const result = await fetchStaticInputs()

            expect(result).toEqual(partialData)
        })

        it('should use correct database query parameters', async () => {
            mockDbConnect.mockResolvedValue({} as any)
            const mockSelect = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockStaticInputsData)
            })
            mockStaticInputs.findOne.mockReturnValue({
                select: mockSelect
            } as any)

            await fetchStaticInputs()

            expect(mockStaticInputs.findOne).toHaveBeenCalledWith()
            expect(mockSelect).toHaveBeenCalledWith({
                amenities: 1,
                property_types: 1,
                _id: 0
            })
        })

        it('should handle empty string errors', async () => {
            mockDbConnect.mockResolvedValue({} as any)
            mockStaticInputs.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockRejectedValue('')
                })
            } as any)

            await expect(fetchStaticInputs()).rejects.toThrow(
                'Failed to fetch static inputs: '
            )
        })

        it('should handle null errors', async () => {
            mockDbConnect.mockResolvedValue({} as any)
            mockStaticInputs.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockRejectedValue(null)
                })
            } as any)

            await expect(fetchStaticInputs()).rejects.toThrow(
                'Failed to fetch static inputs: null'
            )
        })
    })
})