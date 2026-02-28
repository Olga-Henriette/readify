"use client";

import { useState } from "react";
import { useForm } from "react-hook-form"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, type BookFormValues } from "@/lib/validations/book";
import { createBook } from "@/lib/actions/book-actions";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      stock: 1,
    },
  });

  const onSubmit = async (data: BookFormValues) => {
    setLoading(true);
    try {
      await createBook(data);
      toast.success("Livre ajouté au catalogue");
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Ajouter un livre
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau Livre</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour ajouter un ouvrage au catalogue.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" {...form.register("title")} placeholder="Ex: L'Étranger" />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Auteur</Label>
            <Input id="author" {...form.register("author")} placeholder="Albert Camus" />
            {form.formState.errors.author && (
              <p className="text-sm text-destructive">{form.formState.errors.author.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" {...form.register("isbn")} placeholder="978..." />
              {form.formState.errors.isbn && (
                <p className="text-sm text-destructive">{form.formState.errors.isbn.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Quantité</Label>
              <Input 
                id="stock" 
                type="number" 
                {...form.register("stock", { valueAsNumber: true })}
              />
              {form.formState.errors.stock && (
                <p className="text-sm text-destructive">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer le livre"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}