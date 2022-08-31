import Image from "next/image";
import { usePlaylistContext } from "../contexts/PlaylistContext";
import { useSongContext } from "../contexts/SongContext";
import useSpotify from "../hooks/useSpotify";
import { SongReducerActionType } from "../types";
import { convertDuration } from "../utils/durationConverter";

interface Props {
  item: SpotifyApi.TrackObjectFull | null;
  itemIndex: number;
}

export const Song = ({ item, itemIndex }: Props) => {
  const spotifyApi = useSpotify();

  const {
    songContextState: { deviceId },
    dispatchSongAction,
  } = useSongContext();

  const {
    playlistContextState: { selectedPlaylist },
  } = usePlaylistContext();

  const playSong = async () => {
    if (!deviceId) return;

    dispatchSongAction({
      type: SongReducerActionType.SetCurrentPlayingSong,
      payload: {
        selectedSongId: item?.id,
        selectedSong: item,
        isPlaying: true,
      },
    });

    await spotifyApi.play({
      device_id: deviceId,
      context_uri: selectedPlaylist?.uri,
      offset: {
        uri: item?.uri as string,
      },
    });
  };

  return (
    <div
      className="grid grid-cols-2 text-gray-500 px-5 py-4 hover:bg-gray-900 rounded-lg cursor-pointer"
      onClick={playSong}
    >
      <div className="flex items-center space-x-4">
        <p>{itemIndex + 1}</p>
        <div className="">
          <Image
            src={item?.album.images[0].url || ""}
            alt="Track Cover"
            height="40px"
            width="40px"
          />
        </div>

        <div>
          <p className="w-36 lg:w-72 truncate text-white">{item?.name}</p>
          <p className="w-40">{item?.artists[0].name}</p>
        </div>
      </div>

      <div className="flex justify-between items-center ml-auto md:ml-0">
        <p className="hidden md:block w-40">{item?.album.name}</p>
        <p>{convertDuration(item?.duration_ms as number)}</p>
      </div>
    </div>
  );
};
