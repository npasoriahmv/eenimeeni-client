import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import PlayzoneHistory from "./PlayzoneHistory"
import WorkshopHistory from "./WorkshopHistory"
import VenueHistory from "./VenueHistory"
import PartyHistory from "./PartyHistory"
import EmmPartyHistory from "./EmmmPartyHistory"

export default function HistoryTabs() {
  return (
    <Tabs defaultValue="playzone" className="space-y-6">
      <TabsList className="grid grid-cols-2 sm:grid-cols-5">
        <TabsTrigger value="playzone">Playzone</TabsTrigger>
        <TabsTrigger value="workshop">Workshop</TabsTrigger>
        <TabsTrigger value="venue">Venue</TabsTrigger>
        <TabsTrigger value="party">MinyMoe Party</TabsTrigger>
        <TabsTrigger value="emmm-party">EeniMeeni-MinyMoe Party</TabsTrigger>
      </TabsList>

      <TabsContent value="playzone">
        <PlayzoneHistory />
      </TabsContent>

      <TabsContent value="workshop">
        <WorkshopHistory />
      </TabsContent>

      <TabsContent value="venue">
        <VenueHistory />
      </TabsContent>

      <TabsContent value="party">
        <PartyHistory />
      </TabsContent>

      <TabsContent value="emmm-party">
        <EmmPartyHistory/>
      </TabsContent>
    </Tabs>
  )
}
