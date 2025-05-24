"use client"

import { memo, useState, useMemo } from "react"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ViewPerPage } from "@/components/view-per-page"
import type { PaginationData } from "@/types"
import { LaravelPagination } from "@/components/laravel-pagination"

const DataTable = <TData,>({
                               columns: userColumns,
                               data,
                               pagination,
                               showViewPerPage = true,
                               withNumber = false,
                           }: {
    columns: ColumnDef<TData>[]
    data: TData[]
    pagination?: PaginationData<TData[]>
    showViewPerPage?: boolean
    withNumber?: boolean
}) => {
    const [sorting, setSorting] = useState<SortingState>([])
    const [rowSelection, setRowSelection] = useState({})

    // Create columns with number column if withNumber is true
    const columns = useMemo(() => {
        if (!withNumber) return userColumns

        const numberColumn: ColumnDef<TData> = {
            id: "index",
            header: () => <div className="text-center">No.</div>,
            cell: ({ table, row }) => {
                // Get the row's position in the sorted/filtered data
                const rowIndex = table.getSortedRowModel().rows.findIndex((r) => r.id === row.id)
                const from = pagination?.from || 1

                return <div className="text-center">{from + rowIndex}</div>
            },
            enableSorting: false,
        }

        return [numberColumn, ...userColumns]
    }, [userColumns, withNumber, pagination?.from])

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange: setRowSelection,
        state: { sorting, rowSelection },
    })

    return (
        <>
            <div className="mx-auto md:mx-0 rounded-md border overflow-x-auto w-[82vw] sm:w-[90vw] md:w-full">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Tidak ada data untuk ditampilkan
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {showViewPerPage && <ViewPerPage className="flex-1 pb-0.5" />}
            {pagination && <LaravelPagination pagination={pagination} />}
        </>
    )
}

export default memo(DataTable) as typeof DataTable

