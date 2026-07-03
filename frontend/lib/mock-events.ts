// TODO: Replace with GET /events?startFrom= (see api_contract.json)
export const mockEvents = [
  {
    id: "1",
    title: "Sunday Morning Ride",
    date: "2026-07-06T07:00:00",
    dateLabel: "Jul 6, 2026 - 7:00 AM",
    location: "Club HQ",
    description: "An easy-paced group ride through the city outskirts, ending with breakfast at Club HQ.",
  },
  {
    id: "2",
    title: "Charity Run for Local Shelter",
    date: "2026-07-19T09:00:00",
    dateLabel: "Jul 19, 2026 - 9:00 AM",
    location: "City Park",
    description: "Annual charity ride raising funds and supplies for the local animal shelter.",
  },
  {
    id: "3",
    title: "Annual Members Meetup",
    date: "2026-08-02T17:00:00",
    dateLabel: "Aug 2, 2026 - 5:00 PM",
    location: "Riverside Grounds",
    description: "Club-wide meetup with food, awards, and planning for next year's rides.",
  },
  {
    id: "4",
    title: "Night Ride & Bonfire",
    date: "2026-08-15T18:00:00",
    dateLabel: "Aug 15, 2026 - 6:00 PM",
    location: "Lakeside Camp",
    description: "Evening ride out to the lake followed by a bonfire and cookout.",
  },
  {
    id: "5",
    title: "Club Anniversary Gathering",
    date: "2026-09-05T16:00:00",
    dateLabel: "Sep 5, 2026 - 4:00 PM",
    location: "Club HQ",
    description: "Celebrating another year of the club with members, family, and friends.",
  },
];

export type MockEvent = (typeof mockEvents)[number];
