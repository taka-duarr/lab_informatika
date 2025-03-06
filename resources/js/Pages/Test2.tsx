"use client"

import { useState } from "react"
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
import { GripVertical, Plus, ChevronUp, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Define the card data type
interface CardData {
    id: string
    order: number
    name: string
}

type Praktikan = {
    id: string;
    username: string;
    nama: string;
    krs: string | null;
    pembayaran: string | null;
    modul: string | null;
    terverifikasi: boolean;
    aslab: {
        id: string;
        nama: string;
    } | null;
    sesi: {
        id: string;
        nama: string;
    } | null;
};
type Praktikum = {
    id: string;
    nama: string;
    tahun: number;
    jenis: {
        id: string;
        nama: string;
    };
    periode: {
        id: string;
        nama: string;
    };
    laboratorium: {
        id: string;
        nama: string;
    };
    praktikan: Praktikan[];
};

// Sortable card component
function SortableCard({
                          card,
                          onMoveUp,
                          onMoveDown,
                          isFirst,
                          isLast,
                      }: {
    card: CardData
    onMoveUp: () => void
    onMoveDown: () => void
    isFirst: boolean
    isLast: boolean
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <Card ref={setNodeRef} style={style} className="mb-3 border-2 hover:border-primary/50 transition-all">
            <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                <div className="flex items-center">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 mr-2 rounded hover:bg-secondary"
                    >
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="font-medium">Card #{card.order + 1}</div>
                </div>
                <div className="flex space-x-1">
                    <Button variant="outline" size="icon" onClick={onMoveUp} disabled={isFirst} className="h-8 w-8">
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={onMoveDown} disabled={isLast} className="h-8 w-8">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <p className="text-sm">{card.name}</p>
            </CardContent>
        </Card>
    )
}

export default function DragDropCards() {
    const [cards, setCards] = useState<CardData[]>([
        { id: "1", order: 0, name: "First Card" },
        { id: "2", order: 1, name: "Second Card" },
        { id: "3", order: 2, name: "Third Card" },
    ])
    const [newCardName, setNewCardName] = useState("")

    // Set up sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    // Handle drag end event
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setCards((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)

                // Create a new array with the updated order
                const newItems = arrayMove(items, oldIndex, newIndex)

                // Update the order property for each card
                return newItems.map((item, index) => ({
                    ...item,
                    order: index,
                }))
            })
        }
    }

    // Add a new card
    const handleAddCard = () => {
        if (newCardName.trim() === "") return

        const newCard: CardData = {
            id: Date.now().toString(),
            order: cards.length,
            name: newCardName,
        }

        setCards([...cards, newCard])
        setNewCardName("")
    }

    const moveCardUp = (index: number) => {
        if (index <= 0) return

        setCards((prevCards) => {
            const newCards = [...prevCards]
            // Swap the cards
            const temp = newCards[index]
            newCards[index] = newCards[index - 1]
            newCards[index - 1] = temp

            // Update the order property for each card
            return newCards.map((card, idx) => ({
                ...card,
                order: idx,
            }))
        })
    }

    const moveCardDown = (index: number) => {
        if (index >= cards.length - 1) return

        setCards((prevCards) => {
            const newCards = [...prevCards]
            // Swap the cards
            const temp = newCards[index]
            newCards[index] = newCards[index + 1]
            newCards[index + 1] = temp

            // Update the order property for each card
            return newCards.map((card, idx) => ({
                ...card,
                order: idx,
            }))
        })
    }

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Drag & Drop Cards</h2>

            {/* Add new card form */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="card-name">Card Name</Label>
                            <Input
                                id="card-name"
                                placeholder="Enter card name"
                                value={newCardName}
                                onChange={(e) => setNewCardName(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleAddCard} className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add Card
                    </Button>
                </CardFooter>
            </Card>

            {/* Sortable cards list */}
            <div className="space-y-2">
                <h3 className="text-lg font-medium mb-3">Cards (Drag to reorder)</h3>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                        {cards.map((card, index) => (
                            <SortableCard
                                key={card.id}
                                card={card}
                                onMoveUp={() => moveCardUp(index)}
                                onMoveDown={() => moveCardDown(index)}
                                isFirst={index === 0}
                                isLast={index === cards.length - 1}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {cards.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No cards yet. Add a card to get started.</p>
                )}
            </div>
        </div>
    )
}

