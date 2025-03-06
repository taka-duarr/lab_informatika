"use client"

import React, { useState, useCallback, useMemo } from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, ChevronUp, ChevronDown, Trash, Edit, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { v4 as uuid } from "uuid"
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type JenisNilai = {
    id: string
    nama: string
    urutan: number
}

interface SortableCardProps {
    item: JenisNilai
    onMoveUp: () => void
    onMoveDown: () => void
    onRemove: () => void
    onUpdate: (newName: string) => void
    isFirst: boolean
    isLast: boolean
}

const SortableCard = React.memo(
    ({ item, onMoveUp, onMoveDown, onRemove, onUpdate, isFirst, isLast }: SortableCardProps) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
        const [isEditing, setIsEditing] = useState(false)
        const [newName, setNewName] = useState(item.nama)
        const [showRemoveDialog, setShowRemoveDialog] = useState(false)

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        }

        const handleUpdate = useCallback(() => {
            onUpdate(newName)
            setIsEditing(false)
        }, [newName, onUpdate])

        const cancelEdit = useCallback(() => {
            setNewName(item.nama)
            setIsEditing(false)
        }, [item.nama])

        return (
            <>
                <Card
                    ref={setNodeRef}
                    style={style}
                    className="mb-3 border-2 hover:border-primary/50 transition-all shadow-none"
                >
                    <CardHeader className="p-3 flex flex-row items-center justify-between">
                        {isEditing ? (
                            <div className="flex-1 flex items-center gap-2">
                                <div className="font-medium">#{item.urutan + 1}</div>
                                <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1" />
                                <Button variant="outline" size="icon" onClick={handleUpdate} className="h-8 w-8">
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={cancelEdit} className="h-8 w-8">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center flex-1">
                                    <div
                                        {...attributes}
                                        {...listeners}
                                        className="cursor-grab active:cursor-grabbing p-1 mr-2 rounded hover:bg-secondary"
                                    >
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="font-medium">
                                        #{item.urutan + 1} - {item.nama}
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <Button variant="outline" size="icon" onClick={onMoveUp} disabled={isFirst} className="h-8 w-8">
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={onMoveDown} disabled={isLast} className="h-8 w-8">
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => setShowRemoveDialog(true)} className="h-8 w-8">
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardHeader>
                </Card>
                <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to remove this item?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the jenis nilai.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onRemove}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        )
    },
)

SortableCard.displayName = "SortableCard"

interface JenisNilaiSorterProps {
    initialData: JenisNilai[]
    onUpdate: (newData: JenisNilai[]) => void
}

export default function JenisNilaiSorter({ initialData, onUpdate }: JenisNilaiSorterProps) {
    const [items, setItems] = useState<JenisNilai[]>(initialData)
    const [newItemName, setNewItemName] = useState("")

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => a.urutan - b.urutan)
    }, [items])

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event

            if (over && active.id !== over.id) {
                setItems((currentItems) => {
                    const oldIndex = currentItems.findIndex((item) => item.id === active.id)
                    const newIndex = currentItems.findIndex((item) => item.id === over.id)

                    const newItems = arrayMove(currentItems, oldIndex, newIndex).map((item, index) => ({
                        ...item,
                        urutan: index,
                    }))

                    onUpdate(newItems)
                    return newItems
                })
            }
        },
        [onUpdate],
    )

    const handleAddItem = useCallback(() => {
        if (newItemName.trim() === "") return

        setItems((prevItems) => {
            const newItems = [...prevItems, { id: uuid(), nama: newItemName, urutan: prevItems.length }]
            onUpdate(newItems)
            return newItems
        })

        setNewItemName("")
    }, [newItemName, onUpdate])

    const moveItem = useCallback(
        (index: number, direction: "up" | "down") => {
            setItems((prevItems) => {
                const newIndex = direction === "up" ? index - 1 : index + 1
                if (newIndex < 0 || newIndex >= prevItems.length) return prevItems

                const newItems = arrayMove(prevItems, index, newIndex).map((item, idx) => ({
                    ...item,
                    urutan: idx,
                }))
                onUpdate(newItems)
                return newItems
            })
        },
        [onUpdate],
    )

    const removeItem = useCallback(
        (id: string) => {
            setItems((prevItems) => {
                const newItems = prevItems
                    .filter((item) => item.id !== id)
                    .map((item, index) => ({
                        ...item,
                        urutan: index,
                    }))
                onUpdate(newItems)
                return newItems
            })
        },
        [onUpdate],
    )

    const updateItemName = useCallback(
        (id: string, newName: string) => {
            setItems((prevItems) => {
                const newItems = prevItems.map((item) => (item.id === id ? { ...item, nama: newName } : item))
                onUpdate(newItems)
                return newItems
            })
        },
        [onUpdate],
    )

    return (
        <div className="w-full mx-auto p-4">
            <div className="space-y-2">
                <h3 className="text-lg font-medium mb-3">Daftar Jenis Nilai (Seret untuk mengurutkan)</h3>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sortedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                        {sortedItems.map((item, index) => (
                            <SortableCard
                                key={item.id}
                                item={item}
                                onMoveUp={() => moveItem(index, "up")}
                                onMoveDown={() => moveItem(index, "down")}
                                onRemove={() => removeItem(item.id)}
                                onUpdate={(newName) => updateItemName(item.id, newName)}
                                isFirst={index === 0}
                                isLast={index === sortedItems.length - 1}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {sortedItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        Belum ada jenis nilai. Tambahkan jenis nilai untuk memulai.
                    </p>
                )}
                <Separator className="!my-5 h-0.5 bg-primary/80" />
                <Card className="border-2 border-primary/50 transition-all shadow-none">
                    <CardHeader className="p-3 flex flex-row items-center justify-between gap-3">
                        <div className="flex items-center justify-center font-medium">
                            <GripVertical className="text-muted-foreground" />
                            <p>#{items.length + 1}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-1 !my-0">
                            <Input
                                id="item-name"
                                placeholder="Masukkan nama jenis nilai"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-1 !my-0">
                            <Button onClick={handleAddItem} disabled={!newItemName}>
                                Tambahkan <Plus />
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}

