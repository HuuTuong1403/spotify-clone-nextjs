import { createContext, useContext, useEffect, useReducer } from "react";
import {
  ISongContext,
  SongContextState,
  SongReducerActionType,
} from "../types";
import { ReactNode } from "react";
import useSpotify from "../hooks/useSpotify";
import { useSession } from "next-auth/react";
import { songReducer } from "../reducers/songReducer";

const defaultSongContextState: SongContextState = {
  selectedSongId: undefined,
  selectedSong: null,
  isPlaying: false,
  volume: 50,
  deviceId: null,
};

export const SongContext = createContext<ISongContext>({
  songContextState: defaultSongContextState,
  dispatchSongAction: () => {},
});

export const useSongContext = () => useContext(SongContext);

const SongContextProvider = ({ children }: { children: ReactNode }) => {
  const spotifyApi = useSpotify();

  const { data: session } = useSession();

  const [songContextState, dispatchSongAction] = useReducer(
    songReducer,
    defaultSongContextState
  );

  useEffect(() => {
    const setCurrentDevice = async () => {
      const availableDeviceResponse = await spotifyApi.getMyDevices();

      if (!availableDeviceResponse.body.devices.length) return;

      const { id: deviceId, volume_percent } =
        availableDeviceResponse.body.devices[0];

      dispatchSongAction({
        type: SongReducerActionType.SetDevice,
        payload: {
          deviceId: deviceId,
          volume: volume_percent as number,
        },
      });

      await spotifyApi.transferMyPlayback([deviceId as string]);
    };

    if (spotifyApi.getAccessToken()) {
      setCurrentDevice();
    }
  }, [spotifyApi, session]);

  useEffect(() => {
    const getCurrentPlayingSong = async () => {
      const songInfo = await spotifyApi.getMyCurrentPlayingTrack();

      if (!songInfo.body) return;

      dispatchSongAction({
        type: SongReducerActionType.SetCurrentPlayingSong,
        payload: {
          selectedSongId: songInfo.body.item?.id,
          selectedSong: songInfo.body.item as SpotifyApi.TrackObjectFull,
          isPlaying: songInfo.body.is_playing,
        },
      });
    };

    if (spotifyApi.getAccessToken()) {
      getCurrentPlayingSong();
    }
  }, [session, spotifyApi]);

  const songContextProviderData = {
    songContextState,
    dispatchSongAction,
  };

  return (
    <SongContext.Provider value={songContextProviderData}>
      {children}
    </SongContext.Provider>
  );
};

export default SongContextProvider;
