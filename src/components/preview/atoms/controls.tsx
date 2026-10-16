"use client";
import type { ComponentPropsWithoutRef } from "react";

// Native semantics and caller styles are preserved across every preview screen.
export function Button(props: ComponentPropsWithoutRef<"button">) { return <button {...props} />; }
export function Input(props: ComponentPropsWithoutRef<"input">) { return <input {...props} />; }
export function Textarea(props: ComponentPropsWithoutRef<"textarea">) { return <textarea {...props} />; }
export function Select(props: ComponentPropsWithoutRef<"select">) { return <select {...props} />; }
