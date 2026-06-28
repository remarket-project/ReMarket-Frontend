import { OpenAPI } from "@/client"
import { request as __request } from "@/client/core/request"

export interface PriceSuggestionRequest {
  category_id: string
  condition_grade: string
  title: string
  description?: string
}

export interface PriceSuggestionResponse {
  suggested_price: number
  price_range_min: number
  price_range_max: number
  market_insight: string
  average_price: number
  similar_listings: Array<{
    id?: string
    title: string
    price: number
    condition_grade: string
    location_summary?: string
  }>
  external_references: Array<{
    source: string
    title: string
    search_url: string
  }>
  analysis: string
}

export interface MarketAnalysisResponse {
  listing_id: string
  listing_price: number
  assessment: string
  average_price: number
  price_range_min: number
  price_range_max: number
  reasoning: string
  similar_listings: Array<{
    id?: string
    title: string
    price: number
    condition_grade: string
    location_summary?: string
  }>
  external_references: Array<{
    source: string
    title: string
    search_url: string
  }>
  recommendation: string
}

export function suggestPrice(data: PriceSuggestionRequest) {
  return __request<PriceSuggestionResponse>(OpenAPI, {
    method: "POST",
    url: "/api/v1/market-price/suggest",
    body: data,
    mediaType: "application/json",
  })
}

export function analyzePrice(listingId: string) {
  return __request<MarketAnalysisResponse>(OpenAPI, {
    method: "GET",
    url: "/api/v1/market-price/analyze/{listing_id}",
    path: {
      listing_id: listingId,
    },
  })
}
