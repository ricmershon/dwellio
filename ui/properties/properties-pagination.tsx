'use client';

import { usePathname, useSearchParams } from "next/navigation";

import { generatePagination } from "@/utils/generate-pagination";
import PaginationArrow from "@/ui/shared/pagination-arrow";
import PaginationNumber from "@/ui/shared/pagination-number";
import { useCallback, useMemo } from "react";

interface PropertiesPaginationProps {
    currentPage: number;
    totalPages: number;
}

const PropertiesPagination = ({ currentPage, totalPages }: PropertiesPaginationProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const pagination = useMemo(() => 
        generatePagination(currentPage, totalPages),
        [currentPage, totalPages]
    )

    const createPageURL = useCallback((pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`
    }, [pathname, searchParams])
    
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