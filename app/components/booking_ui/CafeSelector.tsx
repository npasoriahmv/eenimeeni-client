"use client"

import { useMemo } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { Plus, Minus } from "lucide-react"

interface CafeItem {
  item: string
  price: number
  category: string
}

interface SelectedCafeItem extends CafeItem {
  quantity: number
}

interface Props {
  beverages: CafeItem[]
  menuItems: CafeItem[]
  selectedCafeItems: SelectedCafeItem[]
  updateCafeItem: (item: CafeItem, quantity: number) => void
  subtotal: number
}

export default function CafeSelector({
  beverages,
  menuItems,
  selectedCafeItems,
  updateCafeItem,
  subtotal
}: Props) {

  const getQty = (name: string) =>
    selectedCafeItems.find(i => i.item === name)?.quantity || 0

  const groupItems = (items: CafeItem[]) => {
    return items.reduce<Record<string, CafeItem[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    }, {})
  }

  const renderCategory = (items: CafeItem[]) => {

    const grouped = groupItems(items)

    return Object.entries(grouped).map(([category, list]) => (

      <div key={category}>

        {/* Category header */}
        <div className="flex items-center gap-2 mb-2 mt-4">

          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>

          <Separator className="flex-1"/>
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 gap-2">

          {list.map(item => {

            const qty = getQty(item.item)
            const isSelected = qty > 0

            return (
              <Card
                key={item.item}
                className={`p-3 transition-all border cursor-pointer
                ${isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/40"}
                `}
              >

                <div className="flex items-center justify-between">

                  {/* Item info */}
                  <div>

                    <p className="font-medium text-sm">
                      {item.item}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      ₹{item.price}
                    </p>

                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">

                    {qty > 0 && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() =>
                          updateCafeItem(item, qty - 1)
                        }
                      >
                        <Minus size={14}/>
                      </Button>
                    )}

                    {qty > 0 && (
                      <Badge className="min-w-[28px] justify-center">
                        {qty}
                      </Badge>
                    )}

                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateCafeItem(item, qty + 1)
                      }
                    >
                      <Plus size={14}/>
                    </Button>

                  </div>

                </div>

              </Card>
            )
          })}
        </div>

      </div>
    ))
  }

  return (
    <Card className="p-4 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">

        <div>
          <h3 className="font-semibold">
            Cafe Add-ons
          </h3>

          <p className="text-xs text-muted-foreground">
            Optional snacks & drinks
          </p>
        </div>

        {subtotal > 0 && (
          <Badge className="text-sm px-3 py-1">
            ₹{subtotal}
          </Badge>
        )}

      </div>

      {/* Tabs */}
      <Tabs defaultValue="beverages">

        <TabsList className="grid grid-cols-2 w-full mb-2">

          <TabsTrigger value="beverages">
            Beverages
          </TabsTrigger>

          <TabsTrigger value="food">
            Food
          </TabsTrigger>

        </TabsList>

        {/* Beverage tab */}
        <TabsContent value="beverages">

          <ScrollArea className="h-72 pr-3">

            {beverages.length === 0
              ? (
                <p className="text-sm text-muted-foreground">
                  No beverages available
                </p>
              )
              : renderCategory(beverages)
            }

          </ScrollArea>

        </TabsContent>

        {/* Food tab */}
        <TabsContent value="food">

          <ScrollArea className="h-72 pr-3">

            {menuItems.length === 0
              ? (
                <p className="text-sm text-muted-foreground">
                  No food available
                </p>
              )
              : renderCategory(menuItems)
            }

          </ScrollArea>

        </TabsContent>

      </Tabs>

    </Card>
  )
}
