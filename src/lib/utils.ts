import { AddressRequest, AddressResponse } from "@/app/api/graphql/route"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getErrorMessage = (req: AddressRequest): string => {
  if(req.postcode && req.suburb && req.state) {
      return `The ${req.postcode} does not match the suburb ${req.suburb} or state ${req.state}`
  }
  if (req.postcode && req.suburb) {
      return `The ${req.postcode} does not match the suburb ${req.suburb}`
  }
  if (req.suburb && req.state) {
      return `The suburb ${req.suburb} does not exist in the state (${req.state})`
  }

  return `There is no data mathing this request`;
}

export const getSuccessMessage = (req: AddressRequest) => {
  if (req.postcode && req.state && req.suburb) {
      return `The postcode, suburb, and state input are valid.`
  }
  if (req.postcode && req.suburb) {
      return `The postcode ${req.postcode} match the suburb ${req.suburb}`
  }
  if (req.suburb && req.state) {
      return `The suburb ${req.suburb} exist in the state (${req.state})`
  }

  return `The response was successful`;
}


export const transformResponse = (data: AddressResponse, req: AddressRequest) => {
  if (data.localities === '') {
      return {
          success: false,
          message: getErrorMessage(req)
      }
  }
  if (data.localities && data.localities) {
      return {
          success: true,
          message: getSuccessMessage(req),
      };
  }

  return {
      success: false,
      message: "No valid locality found.",
  };
};