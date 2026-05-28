from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Mapping

from pydantic import BaseModel, ConfigDict, Field

from src.config import config


DEFINE_PATTERN = re.compile(
    r'^\s*#\s*DEFINE\s+([A-Z0-9_]+)\s+"(.*)"\s*$', re.MULTILINE)
PLACEHOLDER_PATTERN = re.compile(r'\$\{([A-Z0-9_]+)\}')


class PromptManifest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    version: str
    macros_file: str = Field(alias="macrosFile")
    system_fragments: list[str] = Field(alias="systemFragments")
    user_template: str = Field(alias="userTemplate")
    defaults: dict[str, str] = Field(default_factory=dict)


class PromptRenderResult(BaseModel):
    version: str
    system_prompt: str
    user_prompt: str
    resolved_variables: dict[str, str]


class PromptBundle:
    def __init__(self, manifest: PromptManifest, manifest_dir: Path):
        self.manifest = manifest
        self.manifest_dir = manifest_dir
        self.macros = self._load_macros(manifest.macros_file)
        self.system_template = self._load_system_template()
        self.user_template = self._read_text(manifest.user_template)

    def _read_text(self, relative_path: str) -> str:
        return (self.manifest_dir / relative_path).read_text(encoding="utf-8").strip()

    def _load_macros(self, relative_path: str) -> dict[str, str]:
        macro_text = self._read_text(relative_path)
        return {
            match.group(1): match.group(2)
            for match in DEFINE_PATTERN.finditer(macro_text)
        }

    def _load_system_template(self) -> str:
        fragments = [self._read_text(fragment)
                     for fragment in self.manifest.system_fragments]
        return "\n\n".join(fragment for fragment in fragments if fragment)

    def render(self, dynamic_values: Mapping[str, str | int | float | None]) -> PromptRenderResult:
        resolved = {**self.macros, **self.manifest.defaults}
        resolved.update(
            {
                key: "" if value is None else str(value)
                for key, value in dynamic_values.items()
            }
        )

        system_prompt = self._render_text(self.system_template, resolved)
        user_prompt = self._render_text(self.user_template, resolved)
        return PromptRenderResult(
            version=self.manifest.version,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            resolved_variables=resolved,
        )

    def get_value(self, key: str, default: str = "") -> str:
        if key in self.manifest.defaults:
            return self.manifest.defaults[key]
        return self.macros.get(key, default)

    def _render_text(self, template: str, variables: Mapping[str, str]) -> str:
        rendered = PLACEHOLDER_PATTERN.sub(
            lambda match: variables.get(match.group(1), match.group(0)),
            template,
        ).strip()

        unresolved = sorted(set(PLACEHOLDER_PATTERN.findall(rendered)))
        if unresolved:
            missing = ", ".join(unresolved)
            raise ValueError(f"Unresolved prompt variables: {missing}")

        return rendered


def load_prompt_bundle() -> PromptBundle:
    backend_root = Path(__file__).resolve().parents[2]
    manifest_path = backend_root / config.ask_ai_settings.prompt_manifest_path
    manifest = PromptManifest.model_validate(
        json.loads(manifest_path.read_text(encoding="utf-8"))
    )
    return PromptBundle(manifest=manifest, manifest_dir=manifest_path.parent)
