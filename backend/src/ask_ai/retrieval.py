from __future__ import annotations

from dataclasses import dataclass
import re

from src.config import config
from src.products.models import ProductSearchRequest
from src.products.utils import (
    get_products_by_ids_from_db,
    get_products_from_db,
    get_top_10_new_products_from_db,
    get_top_10_products_with_highest_price_from_db,
    get_top_10_products_with_lowest_price_from_db,
    get_top_10_products_with_lowest_stock_from_db,
)
from src.sql.db import DBSession
from src.sql.models import Product
from src.vector_store.db import get_chroma_client


DOMAIN_KEYWORDS = {
    "produkt",
    "produkty",
    "lego",
    "klock",
    "zestaw",
    "cena",
    "po ile",
    "za ile",
    "budżet",
    "budzet",
    "koszt",
    "dostępność",
    "dostepnosc",
    "kategoria",
    "kategorie",
    "sklep",
    "zakup",
    "kup",
    "poleć",
    "polec",
    "polecasz",
    "podobny",
    "podobne",
    "najtań",
    "najtans",
    "najdroż",
    "najdroz",
    "nowy",
    "nowość",
    "nowosc",
    "stan",
    "magazyn",
}

RECOMMENDATION_KEYWORDS = {
    "poleć",
    "polec",
    "polecasz",
    "rekomend",
    "prezent",
    "propozycj",
    "szukam",
    "chcę",
    "chce",
}

GENERIC_RECOMMENDATION_STEMS = {
    "polec",
    "rekomend",
    "propozyc",
    "prezent",
    "szuk",
    "klock",
    "produkt",
    "zakup",
    "sklep",
    "now",
    "tani",
    "drog",
    "budzet",
    "budżet",
}

STOPWORDS = {
    "a",
    "ale",
    "albo",
    "bo",
    "by",
    "byc",
    "być",
    "co",
    "czy",
    "dla",
    "do",
    "i",
    "jak",
    "jaka",
    "jakie",
    "jaki",
    "hej",
    "siema",
    "ej",
    "czesc",
    "cześć",
    "jest",
    "już",
    "lub",
    "lubi",
    "ma",
    "mam",
    "mama",
    "mi",
    "na",
    "nie",
    "o",
    "od",
    "oraz",
    "po",
    "pod",
    "przy",
    "się",
    "sie",
    "tej",
    "ten",
    "to",
    "tu",
    "w",
    "we",
    "warto",
    "z",
    "za",
    "ze",
}

TOKEN_PATTERN = re.compile(r"[0-9a-ząćęłńóśźż]+", re.IGNORECASE)
VECTOR_COLLECTION_NAME = "products_collection"


@dataclass(frozen=True)
class CatalogContext:
    use_case: str
    products: list[Product]
    rendered_context: str
    is_domain_context: bool


def _normalize_message(message: str) -> str:
    return message.strip().lower()


def _extract_search_terms(message: str) -> list[str]:
    candidates: list[str] = []
    seen: set[str] = set()

    for raw_token in TOKEN_PATTERN.findall(_normalize_message(message)):
        token = raw_token.strip()
        if len(token) < 3 or token in STOPWORDS:
            continue

        variants = [token]
        if token.endswith("ów") and len(token) > 4:
            variants.append(token[:-2])
        elif token.endswith("ow") and len(token) > 4:
            variants.append(token[:-2])
        elif token.endswith(("y", "i", "e", "a")) and len(token) > 4:
            variants.append(token[:-1])

        for variant in variants:
            if len(variant) < 3 or variant in seen:
                continue
            seen.add(variant)
            candidates.append(variant)

    return candidates


async def _search_products_from_candidates(
    session: DBSession,
    search_candidates: list[str],
    limit: int,
) -> list[Product]:
    collected: list[Product] = []
    seen_ids: set[int] = set()

    for candidate in search_candidates:
        products = await get_products_from_db(
            session,
            ProductSearchRequest(
                category="",
                substring=candidate,
                limit=limit,
                offset=0,
            ),
        )
        for product in products:
            product_id = product.get_id()
            if product_id in seen_ids:
                continue
            seen_ids.add(product_id)
            collected.append(product)
            if len(collected) >= limit:
                return collected

    return collected


async def _search_products_by_embedding(
    session: DBSession,
    query: str,
    limit: int,
) -> list[Product]:
    normalized_query = query.strip()
    if not normalized_query:
        return []

    try:
        collection = get_chroma_client().get_or_create_collection(
            name=VECTOR_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        result = collection.query(
            query_texts=[normalized_query],
            n_results=max(limit * 4, limit),
            include=["distances", "metadatas"],
        )
    except Exception:
        return []

    ids = result.get("ids")
    if not ids or not ids[0]:
        return []

    ordered_product_ids: list[int] = []
    seen_ids: set[int] = set()
    for raw_id in ids[0]:
        try:
            product_id = int(raw_id)
        except (TypeError, ValueError):
            continue

        if product_id in seen_ids:
            continue

        seen_ids.add(product_id)
        ordered_product_ids.append(product_id)
        if len(ordered_product_ids) >= limit:
            break

    if not ordered_product_ids:
        return []

    products = await get_products_by_ids_from_db(session, ordered_product_ids)
    product_by_id = {product.get_id(): product for product in products}

    ordered_products: list[Product] = []
    for product_id in ordered_product_ids:
        product = product_by_id.get(product_id)
        if product is not None:
            ordered_products.append(product)

    return ordered_products


def _looks_domain_related(message: str) -> bool:
    normalized_message = _normalize_message(message)
    return any(keyword in normalized_message for keyword in DOMAIN_KEYWORDS)


def _looks_recommendation_request(message: str) -> bool:
    normalized_message = _normalize_message(message)
    return any(keyword in normalized_message for keyword in RECOMMENDATION_KEYWORDS)


def _is_general_recommendation_request(message: str) -> bool:
    terms = _extract_search_terms(message)
    if not terms:
        return True

    specific_terms = [
        term
        for term in terms
        if not any(stem in term for stem in GENERIC_RECOMMENDATION_STEMS)
    ]
    return len(specific_terms) == 0


def _format_product(product: Product) -> str:
    description = " ".join(product.description.split())
    categories = ", ".join(product.categories)
    return (
        f"- #{product.get_id()} | {product.name} | cena: {product.price} zł | "
        f"dostępność: {product.amount} | kategorie: {categories} | opis: {description}"
    )


def _format_catalog_context(products: list[Product]) -> str:
    if not products:
        return "Brak dopasowanych produktów w katalogu dla tej wiadomości."

    return "\n".join(_format_product(product) for product in products)


async def build_catalog_context(
    session: DBSession,
    user_message: str,
    recent_user_messages: list[str] | None = None,
) -> CatalogContext:
    recent_user_messages = recent_user_messages or []
    normalized_message = _normalize_message(user_message)
    combined_message = " ".join([*recent_user_messages, user_message]).strip()
    limit = config.ask_ai_settings.max_context_products
    use_case = "wyszukiwanie produktów po nazwie, opisie lub kategorii"
    is_recommendation_request = _looks_recommendation_request(combined_message)
    is_general_recommendation = _is_general_recommendation_request(
        user_message)

    if "najtań" in normalized_message or "najtans" in normalized_message:
        use_case = "ranking najtańszych produktów"
        products = await get_top_10_products_with_lowest_price_from_db(session)
    elif "najdroż" in normalized_message or "najdroz" in normalized_message:
        use_case = "ranking najdroższych produktów"
        products = await get_top_10_products_with_highest_price_from_db(session)
    elif "now" in normalized_message:
        use_case = "przegląd najnowszych produktów"
        products = await get_top_10_new_products_from_db(session)
    elif "magazyn" in normalized_message or "stan" in normalized_message:
        use_case = "przegląd produktów o najniższym stanie magazynowym"
        products = await get_top_10_products_with_lowest_stock_from_db(session)
    else:
        search_candidates = [user_message.strip()]
        search_candidates.extend(_extract_search_terms(user_message))
        if recent_user_messages:
            use_case = "rekomendacje produktowe w aktywnej rozmowie"
            search_candidates.extend(_extract_search_terms(combined_message))

        deduplicated_candidates: list[str] = []
        seen_candidates: set[str] = set()
        for candidate in search_candidates:
            normalized_candidate = candidate.strip()
            if not normalized_candidate or normalized_candidate in seen_candidates:
                continue
            seen_candidates.add(normalized_candidate)
            deduplicated_candidates.append(normalized_candidate)

        products = await _search_products_from_candidates(
            session,
            deduplicated_candidates,
            limit,
        )

        if not products:
            use_case = "semantyczne wyszukiwanie produktów w katalogu"
            products = await _search_products_by_embedding(
                session,
                user_message,
                limit,
            )

            if not products and recent_user_messages:
                products = await _search_products_by_embedding(
                    session,
                    combined_message,
                    limit,
                )

        if not products and is_recommendation_request and is_general_recommendation:
            use_case = "ogólne rekomendacje produktowe na podstawie aktywnej rozmowy i aktualnego katalogu"
            products = await get_top_10_new_products_from_db(session)

    trimmed_products = list(products[:limit])
    return CatalogContext(
        use_case=use_case,
        products=trimmed_products,
        rendered_context=_format_catalog_context(trimmed_products),
        is_domain_context=bool(trimmed_products)
        and (_looks_domain_related(combined_message) or is_recommendation_request),
    )
