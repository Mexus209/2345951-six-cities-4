
export type OfferType = {
  id: string;
  title: string;
  image: string;
  type: string;
  rating: number;
  price: number;
  city: {
    name: string;
    location: {
      latitude: number;
      longitude: number;
      zoom: number;
    };
  };
  isFavorite: boolean;
  isPremium: boolean;
  };

export type UserType = {
  avatar: string;
  name: string;
  isPro: boolean;
};

export type ReviewType = {
  id: string;
  date: string;
  user: UserType;
  comment: string;
  rating: number;
}
