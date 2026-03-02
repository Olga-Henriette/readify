"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, BookFormValues } from "@/lib/validations/book";
import { updateBook } from "@/lib/actions/book-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl,FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

export function EditBookDialog({ book }: { book: any }) {
  const [open, setOpen] = useState(false);
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      stock: book.stock,
    },
  });

  async function onSubmit(values: BookFormValues) {
    try {
      await updateBook(book.id, values);
      toast.success("Livre mis à jour !");
      setOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Pencil className="h-3 w-3 mr-2" /> Modifier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Modifier l'ouvrage</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="author" render={({ field }) => (
              <FormItem><FormLabel>Auteur</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="isbn" render={({ field }) => (
                 <FormItem><FormLabel>ISBN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
               )} />
               <FormField control={form.control} name="stock" render={({ field }) => (
                 <FormItem><FormLabel>Stock Total</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
               )} />
            </div>
            <Button type="submit" className="w-full">Enregistrer les modifications</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}