import {useParams} from 'react-router-dom';
import {AuthorizationStatus, OfferType} from '../types/offer.tsx';
import NotFoundPage from '../error/not-found.tsx';
import ReviewsList from '../components/review-list.tsx';
import Map from '../components/cities-map.tsx';
import {useAppDispatch, useAppSelector} from '../hooks/index.ts';
import {useEffect, useState} from 'react';
import {fetchSingleOfferAction, fetchCommentsAction, updateFavourite} from '../api/api-action.ts';
import CardsList from '../cards/offerList.tsx';
import {filters, rareOffer} from '../consts/cities.tsx';
import Spinner from './loading-screen.tsx';
import Header from './header.tsx';
import ReviewForm from '../components/review-form.tsx';
import {setOffersDataLoadingStatus, updateFavouritesCounter} from '../store/action.ts';
import {FavouritesStatus} from '../consts/favourites-consts.ts';
import { useNavigate } from 'react-router-dom';

type OffersProps = {
  offers: OfferType[];
}

export default function Offer ({offers}: OffersProps) {
  const isAuthorized = useAppSelector((state) => state.user.authorizationStatus);
  const favouritesCounter = useAppSelector((state) => state.favourites.favouritesCounter);
  const currentOffer = useAppSelector((state) => state.offers.currentOffer);
  const currentReviews = useAppSelector((state) => state.offers.currentReviews);
  const params = useParams();
  const offer = offers.find((o) => o.id === params.id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (offer?.id) {
      dispatch(fetchSingleOfferAction({id: offer.id}));
      dispatch(fetchCommentsAction({id: offer.id}));
      dispatch(setOffersDataLoadingStatus(false));
    }
  }, [dispatch, offer?.id]);
  const [isFavorite, setIsFavorite] = useState(offer?.isFavorite);
  const handleIsFavorite = () => {
    if (isAuthorized !== AuthorizationStatus.Auth) {
      navigate('/login');
      return;
    }
    if (isFavorite) {
      dispatch(updateFavourite({
        id: currentOffer?.id,
        status: FavouritesStatus.DELETE
      }));
      setIsFavorite(false);
      dispatch(updateFavouritesCounter(favouritesCounter - 1));
    } else {
      dispatch(updateFavourite({
        id: currentOffer?.id,
        status: FavouritesStatus.ADD
      }));
      setIsFavorite(true);
      dispatch(updateFavouritesCounter(favouritesCounter + 1));
    }
  };
  const otherOffers = offers.filter((e) => e !== offer);
  const closestOffers = otherOffers.slice(0, 3);
  const points = closestOffers.concat(offers.filter((e) => e === offer)).map((item) => ({
    lat: item.location.latitude,
    lng: item.location.longitude,
    name: item.title,
    ...item
  }));
  if (!offer) {
    return (<NotFoundPage />);
  }
  if (!currentOffer) {
    return <Spinner />;
  }
  const selectedPoint = points.find((o) => o.title === offer.title);
  const offerInside = currentOffer.goods.map((item) => (
    <li className="offer__inside-item" key={item}>
      {item}
    </li>
  ));
  const features = [
    currentOffer?.type.toLowerCase().replace(/\w/, (firstLetter) => firstLetter.toUpperCase()),
    `${currentOffer?.bedrooms} ${currentOffer?.bedrooms > 1 ? 'Bedrooms' : 'Bedroom' }`,
    `Max ${currentOffer?.maxAdults} ${currentOffer?.maxAdults > 1 ? 'adults' : 'adult' }`,
  ];
  const offerFeatures = features.map((item) => (
    <li className="offer__feature offer__feature--entire" key={item}>
      {item}
    </li>
  ));
  const authorized = (
    <button
      className={isFavorite ? 'offer__bookmark-button offer__bookmark-button--active button' : 'offer__bookmark-button button'}
      type="button" onClick={handleIsFavorite}
    >
      <svg className="offer__bookmark-icon" width="31" height="33">
        <use href="#icon-bookmark"></use>
      </svg>
      <span className="visually-hidden">{isFavorite ? 'In bookmarks' : 'To bookmarks'}</span>
    </button>
  );

  return (
    <div className="page">

      <Header/>
      <main className="page__main page__main--offer">
        <section className="offer">
          <div className="offer__gallery-container container">
            <div className="offer__gallery">
              {currentOffer?.images.map((item) => (
                <div className="offer__image-wrapper" key={item}>
                  <img className="offer__image" src={item} alt={`Photo studio ${currentOffer.id}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="offer__container container">
            <div className="offer__wrapper">
              {currentOffer?.isPremium && (
                <div className="offer__mark">
                  <span>Premium</span>
                </div>)}
              <div className="offer__name-wrapper">
                <h1 className="offer__name">
                  {currentOffer?.title}
                </h1>
                {authorized}
              </div>
              {rareOffer(currentOffer?.rating)}
              <ul className="offer__features">
                {offerFeatures}
              </ul>
              <div className="offer__price">
                <b className="offer__price-value">&euro;{currentOffer?.price}</b>
                <span className="offer__price-text">&nbsp;night</span>
              </div>
              <div className="offer__inside">
                <h2 className="offer__inside-title">What&apos;s inside</h2>
                <ul className="offer__inside-list">
                  {offerInside}
                </ul>
              </div>
              <div className="offer__host">
                <h2 className="offer__host-title">Meet the host</h2>
                <div className="offer__host-user user">
                  <div className="offer__avatar-wrapper offer__avatar-wrapper--pro user__avatar-wrapper">
                    <img
                      className="offer__avatar user__avatar"
                      src={currentOffer?.host.avatarUrl}
                      width="74"
                      height="74"
                      alt="Host avatar"
                    />
                  </div>
                  <span className="offer__user-name">{currentOffer?.host.name}</span>
                  <span className="offer__user-status">{currentOffer?.host.isPro ? 'Pro' : 'New'}</span>
                </div>
                <div className="offer__description">
                  <p className="offer__text">
                    {currentOffer?.description}
                  </p>
                </div>
              </div>
              <section className="offer__reviews reviews">
                <ReviewsList reviews={currentReviews} />
                {isAuthorized === AuthorizationStatus.Auth && <ReviewForm offerId={currentOffer?.id} />}
              </section>
            </div>
          </div>
          <Map
            city={currentOffer?.city}
            points={points}
            selectedPoint={selectedPoint}
            height="600px"
            width="1200px"
            className="offer__map map"
          />
        </section>
        <div className="container">
          <section className="near-places places">
            <h2 className="near-places__title">
            Other places in the neighbourhood
            </h2>
            <div className="near-places__list places__list">
              <CardsList citiesCards={closestOffers.map((item) => ({...item, image: item.previewImage, roomName: item.title, roomType: item.type}))} sortType={filters.TOP_RATED}/>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
