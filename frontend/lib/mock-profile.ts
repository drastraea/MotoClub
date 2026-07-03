// TODO: Replace with GET /members/:id/profile (see api_contract.json)
export const mockProfile = {
  name: "Alex Rider",
  email: "alex.rider@example.com",
  phoneNumber: "+62 812-3456-7890",
  placeOfBirth: "Jakarta",
  dateOfBirth: "1995-04-12",
  address: "Jl. Rider No. 12, Jakarta",
  instagramUsername: "@alex.rides",
  bloodType: "O" as const,
  emergencyContactName: "Sam Rider",
  emergencyContactPhoneNumber: "+62 813-9876-5432",
  motorbikeName: "Iron Horse",
  memberSince: "2024-03-01",
  status: "Active",
};

export type MockProfile = typeof mockProfile;
