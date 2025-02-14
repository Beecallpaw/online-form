"use client";
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLazyQuery } from '@apollo/client';
import { VALIDATE_ADDRESS } from './lib/gql';

const formSchema = z.object({
  postcode: z.string()
    .min(4, "Postcode must be 4 digits")
    .max(4, "Postcode must be 4 digits")
    .regex(/^[0-9]+$/, "Postcode must contain only numbers")
    .optional()
    .or(z.literal("")),

  suburb: z.string()
    .min(2, "Suburb must be at least 2 characters")
    .optional()
    .or(z.literal("")),

  state: z.string()
    .min(2, "State must be at least 2 characters")
    .max(3, "State must be 3 characters or less")
    .toUpperCase()
    .optional()
    .or(z.literal(''))
}).refine(data => data.postcode || data.suburb, {
  message: "Either postcode or suburb is required.",
  path: ["postcode"],
});

type FormValues = z.infer<typeof formSchema>;

const AddressForm: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validateAddress] = useLazyQuery(VALIDATE_ADDRESS);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postcode: "",
      suburb: "",
      state: "",
    },
  });

  const onSubmit = async (data: FormValues): Promise<void> => {
    setLoading(true);
    try {
      const { data: addressData } = await validateAddress({ variables: data })
      if (addressData.validateAddress.success) {
        setSuccessMessage(addressData.validateAddress.message)
        form.reset();
      } else {
        setError(addressData.validateAddress.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-1/3 mx-auto">
        <h1 className="text-2xl font-semibold mb-8">Address Validation</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <Input placeholder="2000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suburb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suburb</FormLabel>
                  <FormControl>
                    <Input placeholder="Sydney" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="NSW" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full my-4" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate Address'
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert variant="default">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </div>
    </div>


  );
};

export default AddressForm;