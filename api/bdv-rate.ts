import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(204).send('')
  }

  try {
    const response = await fetch(
      'https://www.bcv.org.ve/estadisticas/tipo-cambio-de-referencia-smc',
      { signal: AbortSignal.timeout(15_000) },
    )

    if (!response.ok) {
      return res.status(502).json({ error: `BCV page returned ${response.status}` })
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Find the BDV row — look for "Banco de Venezuela" in the table
    let bdvVenta: number | null = null

    $('table tr').each((_index, row) => {
      const text = $(row).text()
      if (text.includes('Banco de Venezuela') || text.includes('BANCO DE VENEZUELA')) {
        // The "Venta" column is typically the 3rd <td> (index 2)
        const cells = $(row).find('td')
        const ventaText = cells.eq(2).text().trim().replace(',', '.')
        const parsed = parseFloat(ventaText)
        if (!isNaN(parsed)) {
          bdvVenta = parsed
        }
      }
    })

    if (bdvVenta === null) {
      return res.status(404).json({ error: 'Could not find BDV Venta rate on BCV page' })
    }

    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      res.setHeader(key, value)
    }
    return res.status(200).json({
      rate: bdvVenta,
      source: 'bcv-scrape',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return res.status(504).json({ error: 'BCV page timed out' })
    }
    return res.status(502).json({ error: 'Failed to scrape BDV rate' })
  }
}
