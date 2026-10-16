"use client";

import { X } from "lucide-react";
import { Button } from "../atoms/controls";
export function Notice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
 if (!message) return null;
 return <div className="kd-alert" role="status">{message}<Button aria-label="Fechar aviso" onClick={onDismiss}><X/></Button></div>;
}
