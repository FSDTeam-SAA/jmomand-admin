"use client";

import { useParams } from "next/navigation";
import InventoryForm from "../_components/Add-inventory";

export default function EditInventoryPage() {
  const params = useParams<{ id: string }>();

  if (!params.id) return null;

  return <InventoryForm productId={params.id} />;
}
