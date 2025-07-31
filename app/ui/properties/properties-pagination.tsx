'use client';

import { usePathname, useSearchParams } from "next/navigation";

import { generatePagination } from "@/app/utils/generate-pagination";
import PaginationArrow from "@/app/ui/shared/pagination-arrow";
import PaginationNumber from "@/app/ui/shared/pagination-number";

interface PropertiesPaginationProps {
    currentPage: number;
    totalPages: number;
}

const PropertiesPagination = ({ currentPage, totalPages }: PropertiesPaginationProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const pagination = generatePagination(currentPage, totalPages);

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`
    }
    
    return (
        <div className="inline-flex">
            <PaginationArrow
                direction="left"
                href={createPageURL(currentPage - 1)}
                isDisabled={currentPage <= 1}
            />

            <div className="flex -space-x-px">
                {pagination.map((page, index) => {
                    let position: 'first' | 'last' | 'single' | 'middle' | undefined;

                    if (index === 0) {
                        position = 'first';
                    }

                    if (index === pagination.length - 1) {
                        position = 'last';
                    }

                    if (pagination.length === 1) {
                        position = 'single';
                    }

                    if (page === '...') {
                        position = 'middle';
                    }

                    return (
                        <PaginationNumber
                            key={`${page}-${index}`}
                            href={createPageURL(page)}
                            page={page}
                            position={position}
                            isActive={currentPage === page}
                        />
                    );
                })}
            </div>

            <PaginationArrow
                direction="right"
                href={createPageURL(currentPage + 1)}
                isDisabled={currentPage >= totalPages}
            />
        </div>
    );
}

export default PropertiesPagination;