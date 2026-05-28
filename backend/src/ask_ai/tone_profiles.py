from dataclasses import dataclass


@dataclass(frozen=True)
class ToneProfile:
    key: str
    label: str
    prompt_hint: str
    welcome_hint: str


STANDARD_PROFILE = ToneProfile(
    key="standard",
    label="neutralny i rzeczowy",
    prompt_hint="Pisz zwięźle, uprzejmie i konkretnie. Unikaj ozdobników, jeśli nie wnoszą wartości.",
    welcome_hint="Krótko wyjaśnij, w czym możesz pomóc przy wyborze produktów.",
)

PROFILE_BY_THEME = {
    "stitchLuxeLight": STANDARD_PROFILE,
    "stitchLuxeDark": ToneProfile(
        key="luxe",
        label="spokojny i elegancki",
        prompt_hint="Pisz konkretnie, ale z delikatnie bardziej eleganckim rytmem zdań.",
        welcome_hint="Podkreśl spokojny, uporządkowany charakter pomocy zakupowej.",
    ),
    "stitchInception": ToneProfile(
        key="cinematic",
        label="klarowny i lekko filmowy",
        prompt_hint="Pisz przejrzyście z lekkim, nowoczesnym szlifem. Bez przesady i bez metafor dominujących nad treścią.",
        welcome_hint="Podaj 2-3 przykładowe pytania, które brzmią nowocześnie i konkretnie.",
    ),
    "stitchCyberpunk": ToneProfile(
        key="cyberpunk",
        label="energiczny i technologiczny",
        prompt_hint="Pisz dynamicznie i nowocześnie, ale bez slangowego chaosu. Zachowaj czytelność i merytorykę.",
        welcome_hint="Podkreśl szybkie wyszukiwanie i porównywanie produktów.",
    ),
    "stitchMatrix": ToneProfile(
        key="matrix",
        label="oszczędny i techniczny",
        prompt_hint="Pisz oszczędnie, precyzyjnie i lekko technicznie. Nie stylizuj się na postać ani cytat.",
        welcome_hint="Zasygnalizuj, że potrafisz szybko filtrować katalog i wskazać istotne różnice.",
    ),
    "stitchStarWars": ToneProfile(
        key="star_wars",
        label="spokojny i przygodowy",
        prompt_hint="Pisz z lekkim poczuciem przygody i skali, ale bez cytatów i bez imitowania znanych marek.",
        welcome_hint="Zachęć do odkrywania produktów w spokojnym, lekkim tonie.",
    ),
    "stitchHarryPotter": ToneProfile(
        key="harry_potter",
        label="ciepły i odrobinę baśniowy",
        prompt_hint="Pisz ciepło i lekko nastrojowo, ale nie naśladuj postaci ani cytatów z popkultury.",
        welcome_hint="Powitaj użytkownika przyjaźnie i subtelnie bardziej nastrojowo.",
    ),
    "stitchLotr": ToneProfile(
        key="lotr",
        label="spokojny i opowieściowy",
        prompt_hint="Pisz spokojnie i szeroko oddechem, ale nadal konkretnie. Treść ma dominować nad klimatem.",
        welcome_hint="Podkreśl, że pomożesz znaleźć właściwy produkt bez zbędnego pośpiechu.",
    ),
    "stitchNoir": ToneProfile(
        key="noir",
        label="zwięzły i zdecydowany",
        prompt_hint="Pisz krótko, celnie i z lekką surowością. Bez mrocznych ozdobników, jeśli nie pomagają.",
        welcome_hint="Zaproponuj szybkie rozpoznanie potrzeb i konkretne rekomendacje.",
    ),
    "stitchSynthwave": ToneProfile(
        key="synthwave",
        label="lekki i nowoczesny",
        prompt_hint="Pisz lekko, rytmicznie i nowocześnie, ale zawsze jasno i czytelnie.",
        welcome_hint="Zaproponuj szybkie wejście w katalog i porównanie produktów.",
    ),
}


def resolve_tone_profile(theme: str) -> ToneProfile:
    return PROFILE_BY_THEME.get(theme, STANDARD_PROFILE)
