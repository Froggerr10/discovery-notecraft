// Keep-Alive Edge Function para Supabase
// Impede que o projeto seja pausado por inatividade

import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  // Só aceita POST com token secreto
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Validação simples de segurança
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.KEEP_ALIVE_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Ping simples no Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Fazer query leve para manter ativo
    const response = await fetch(`${supabaseUrl}/rest/v1/discovery_sessions?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      }
    })

    if (response.ok) {
      console.log(`[${new Date().toISOString()}] Supabase keep-alive successful`)
      
      return new Response(JSON.stringify({
        status: 'success',
        message: 'Supabase pinged successfully',
        timestamp: new Date().toISOString(),
        responseStatus: response.status
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      throw new Error(`Supabase responded with ${response.status}`)
    }

  } catch (error) {
    console.error('Keep-alive failed:', error)
    
    return new Response(JSON.stringify({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
