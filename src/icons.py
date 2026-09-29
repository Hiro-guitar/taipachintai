K='#1C2426'; T='#0C7F89'; Y='#F6D54A'; W='#FFFFFF'; G='#06C755'; S='#F4CFA8'
def svg(body, vb="0 0 48 48", cls="ic"):
    return f'<svg class="{cls}" viewBox="{vb}" aria-hidden="true">{body}</svg>'
st=f'stroke="{K}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"'
icons={
# pains
'train': svg(f'<path d="M14 6h20a6 6 0 0 1 6 6v20a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V12a6 6 0 0 1 6-6z" fill="{W}" {st}/><path d="M12 12h24v10H12z" fill="{T}" {st}/><circle cx="15" cy="29" r="2" fill="{Y}" stroke="{K}" stroke-width="2"/><circle cx="33" cy="29" r="2" fill="{Y}" stroke="{K}" stroke-width="2"/><path d="M14 36l-5 7M34 36l5 7M11 41h26" {st} fill="none"/>'),
'calendar': svg(f'<rect x="6" y="10" width="30" height="28" rx="4" fill="{W}" {st}/><path d="M6 18h30M14 6v8M28 6v8" {st} fill="none"/><circle cx="34" cy="34" r="9" fill="{Y}" {st}/><path d="M34 29v5l3 2" {st} fill="none"/>'),
'full': svg(f'<path d="M8 22 24 9l16 13v18H8z" fill="{W}" {st}/><rect x="19" y="28" width="10" height="12" fill="{T}" {st}/><rect x="26" y="14" width="18" height="10" rx="3" fill="#E4553B" {st}/><path d="M30 19h10" stroke="{W}" stroke-width="2.5" stroke-linecap="round"/>'),
'map': svg(f'<path d="M6 12l11-4 14 4 11-4v28l-11 4-14-4-11 4z" fill="{W}" {st}/><path d="M17 8v28M31 12v28" {st} fill="none"/><circle cx="36" cy="30" r="8" fill="{Y}" {st}/><path d="M33.5 27.5a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1.9-1.1 1.6M36 34.5v.1" {st} fill="none"/>'),
# solve
'phone': svg(f'<rect x="12" y="4" width="22" height="40" rx="5" fill="{W}" {st}/><path d="M20 38h6" {st} fill="none"/><path d="M18 14h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-6l-4 3v-3h-2a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z" fill="{G}" {st}/>'),
'key': svg(f'<circle cx="16" cy="24" r="9" fill="{Y}" {st}/><circle cx="16" cy="24" r="3" fill="{W}" {st}/><path d="M25 24h17M36 24v6M42 24v5" {st} fill="none"/>'),
'pin': svg(f'<path d="M24 44s-13-13-13-23a13 13 0 0 1 26 0c0 10-13 23-13 23z" fill="{T}" {st}/><circle cx="24" cy="21" r="6" fill="{W}" {st}/><path d="M21.5 21l2 2 3.5-4" {st} fill="none"/>'),
'wallet': svg(f'<rect x="5" y="12" width="36" height="26" rx="5" fill="{W}" {st}/><path d="M5 18h36" {st} fill="none"/><rect x="30" y="22" width="13" height="9" rx="3" fill="{Y}" {st}/><circle cx="35" cy="26.5" r="1.2" fill="{K}"/><path d="M11 12l16-6 4 6" {st} fill="{T}"/>'),
}
route=f'''<svg class="route" viewBox="0 0 360 70" role="img" aria-label="地元から東京へ">
  <path d="M40 46 C120 6, 230 6, 318 40" fill="none" stroke="{K}" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>
  <g transform="translate(24 20)"><path d="M16 36s-12-11-12-20a12 12 0 0 1 24 0c0 9-12 20-12 20z" fill="{W}" {st}/><circle cx="16" cy="16" r="4.5" fill="{Y}" stroke="{K}" stroke-width="2.5"/></g>
  <text x="40" y="68" text-anchor="middle" font-size="12" font-weight="700" fill="{K}">地元</text>
  <g transform="translate(200 8) scale(-1 1) rotate(-6)"><path d="M2 10 18 7l8-6h4l-4 8 8 1 3-3h3l-2 5 2 5h-3l-3-3-8 1 4 8h-4l-8-6-16-3z" fill="{W}" {st}/></g>
  <g transform="translate(300 14)"><rect x="4" y="12" width="14" height="30" fill="{W}" {st}/><rect x="18" y="4" width="16" height="38" fill="{T}" {st}/><path d="M9 20h4M9 28h4M23 12h6M23 20h6M23 28h6" stroke="{K}" stroke-width="2" stroke-linecap="round"/></g>
  <text x="318" y="68" text-anchor="middle" font-size="12" font-weight="700" fill="{K}">東京</text>
</svg>'''
movein=f'''<svg class="movein" viewBox="0 0 220 200" aria-hidden="true">
  <rect x="96" y="30" width="110" height="160" rx="6" fill="#2F3B3E" stroke="{Y}" stroke-width="3"/>
  <g fill="{Y}" opacity=".9"><rect x="110" y="48" width="22" height="18" rx="2"/><rect x="170" y="48" width="22" height="18" rx="2" opacity=".45"/><rect x="110" y="84" width="22" height="18" rx="2" opacity=".45"/><rect x="170" y="84" width="22" height="18" rx="2"/><rect x="110" y="120" width="22" height="18" rx="2"/><rect x="170" y="120" width="22" height="18" rx="2" opacity=".45"/></g>
  <rect x="140" y="150" width="24" height="40" rx="3" fill="{T}" stroke="{Y}" stroke-width="3"/>
  <ellipse cx="60" cy="192" rx="44" ry="6" fill="#000" opacity=".25"/>
  <rect x="40" y="118" width="13" height="72" rx="6" fill="#55636A" stroke="{K}" stroke-width="3"/><rect x="57" y="118" width="13" height="72" rx="6" fill="#55636A" stroke="{K}" stroke-width="3"/>
  <rect x="34" y="66" width="42" height="60" rx="14" fill="{W}" stroke="{K}" stroke-width="3"/>
  <path d="M74 80 C92 70 96 56 98 44" fill="none" stroke="{K}" stroke-width="9" stroke-linecap="round"/><path d="M74 80 C92 70 96 56 98 44" fill="none" stroke="{W}" stroke-width="4" stroke-linecap="round"/>
  <g transform="translate(84 8) rotate(18)"><circle cx="12" cy="12" r="11" fill="{Y}" stroke="{K}" stroke-width="3"/><circle cx="12" cy="12" r="3.5" fill="#2F3B3E"/><path d="M12 23v22M12 34h7M12 42h6" stroke="{Y}" stroke-width="4" stroke-linecap="round"/></g>
  <rect x="48" y="52" width="13" height="10" fill="{S}" stroke="{K}" stroke-width="3"/>
  <circle cx="55" cy="38" r="17" fill="{S}" stroke="{K}" stroke-width="3"/>
  <path d="M38 36c1-11 9-17 18-17 10 0 17 6 17 15-6-4-13-6-21-4-5 1-10 3-14 6z" fill="#5A4636" stroke="{Y}" stroke-width="2"/>
  <path d="M49 40q2-2 4 0M59 40q2-2 4 0" fill="none" stroke="{K}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M50 46q5 5 10 0" fill="none" stroke="{K}" stroke-width="2.2" stroke-linecap="round"/>
</svg>'''
