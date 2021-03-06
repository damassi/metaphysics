import { flatten, groupBy } from "lodash"
import { staticCSVToJSONData } from "./staticCSVToJSONData"

interface ArtistConsignment {
  metadata: {
    highestRealized: string
    realized: string
    recentlySoldArtworkIDs: string[]
    roundedUniqueVisitors: string
    roundedViews: string
    str: string
    uniqueVisitors: string
    views: string
  }
}

/**
 * Return data from microfunnel CSV and add metadata to artist
 */
export function getArtistMicrofunnelMetadata(
  artistPathname: string
): ArtistConsignment {
  const dataGroupedByURL = groupBy(staticCSVToJSONData, "url")

  const mappedData = Object.entries(dataGroupedByURL).reduce(
    (acc, [key, value]) => {
      /**
       * The first item in the array contains metrics related to artist; the rest
       * are artworks to display
       */
      const [meta, ...artworks] = value

      const recentlySoldArtworkIDs = flatten(
        artworks.map((artwork: any) => {
          const id = artwork["Artwork ids (recently sold) (comma separated)"]
          return id
        })
      )

      // Make CSV column metadata easier to reference
      const {
        "views to content from that artist (last month)": views,
        "ROUNDED views to content from that artist (last month)": roundedViews,
        "unique visitors to content from artist (last month)": uniqueVisitors,
        "ROUNDED unique visitors to content from artist (last month)": roundedUniqueVisitors,
        "STR (last 12 months)": str,
        "Realized / estimate": realized,
        "Highest realized price": highestRealized,
      } = meta

      return {
        ...acc,
        [key]: {
          metadata: {
            views,
            roundedViews,
            uniqueVisitors,
            roundedUniqueVisitors,
            str,
            realized,
            highestRealized,
            recentlySoldArtworkIDs,
          },
        },
      }
    },
    {}
  )

  const artistMicrofunnelMetadata = mappedData[artistPathname]
  return artistMicrofunnelMetadata
}

// For individual fields on an artwork type we need to use this function to
// resolve data.
export function getMicrofunnelDataByArtworkInternalID(internalID: string) {
  const dataGroupedByInternalID = groupBy(
    staticCSVToJSONData,
    "Artwork ids (recently sold) (comma separated)"
  )
  const microfunnelData = dataGroupedByInternalID[internalID]
  return microfunnelData?.[0]
}

export function getTargetSupplyArtists() {
  const artworksGroupedBySlug = groupBy(staticCSVToJSONData, "slug")
  return Object.keys(artworksGroupedBySlug).filter((x) => x)
}
