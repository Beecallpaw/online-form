import { AddressRequest, AddressResponse, transformResponse } from "@/app/api/graphql/route";

describe('transformResponse', () => {
    const validLocality = {
        category: "Delivery Area",
        id: 5532,
        latitude: -37.81664,
        location: "EAST MELBOURNE",
        longitude: 144.987811,
        postcode: 3002,
        state: "VIC"
    };

    const validResponse: AddressResponse = {
        localities: {
            locality: [validLocality]
        }
    };

    const emptyResponse: AddressResponse = {
        localities: ""
    };

    it('should return success and valid message when all inputs match', () => {
        const req: AddressRequest = {
            postcode: "3002",
            suburb: "EAST MELBOURNE",
            state: "VIC"
        };

        const result = transformResponse(validResponse, req);
        console.log(result, 'RESULT')
        expect(result.success).toBe(true);
        expect(result.message).toBe("The postcode, suburb, and state input are valid.");
    });

    it('should return success and valid message when only postcode and suburb match', () => {
        const req: AddressRequest = {
            postcode: "3002",
            suburb: "EAST MELBOURNE"
        };

        const result = transformResponse(validResponse, req);
        expect(result.success).toBe(true);
        expect(result.message).toBe(`The postcode ${req.postcode} match the suburb ${req.suburb}`);

    });

    it('should return success and valid message when only suburb and state match', () => {
        const req: AddressRequest = {
            suburb: "EAST MELBOURNE",
            state: "VIC"
        };

        const result = transformResponse(validResponse, req);
        expect(result.success).toBe(true);
        expect(result.message).toBe(`The suburb ${req.suburb} exist in the state (${req.state})`);
    });


    it('should return failure and error message when API response is empty', () => {
        const req: AddressRequest = {
            postcode: "3002",
            suburb: "EAST MELBOURNE",
            state: "VIC"
        };

        const result = transformResponse(emptyResponse, req);
        expect(result.success).toBe(false);
        expect(result.message).toBe(`The ${req.postcode} does not match the suburb ${req.suburb} or state ${req.state}`);
    });

    it('should return failure and error message when API response is empty', () => {
        const req: AddressRequest = {
            postcode: "3002",
            suburb: "EAST MELBOURNE",
        };

        const result = transformResponse(emptyResponse, req);
        expect(result.success).toBe(false);
        expect(result.message).toBe(`The ${req.postcode} does not match the suburb ${req.suburb}`);
    });

    it('should return failure and error message when API response is empty', () => {
        const req: AddressRequest = {
            suburb: "EAST MELBOURNE",
            state: "VIC"
        };

        const result = transformResponse(emptyResponse, req);
        expect(result.success).toBe(false);
        expect(result.message).toBe(`The suburb ${req.suburb} does not exist in the state (${req.state})`);
    });
});