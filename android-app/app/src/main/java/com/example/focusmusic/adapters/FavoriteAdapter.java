package com.example.focusmusic.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.RoundedCorners;
import com.bumptech.glide.request.RequestOptions;
import com.example.focusmusic.R;
import com.example.focusmusic.api.ApiClient;
import com.example.focusmusic.models.Favorite;
import com.example.focusmusic.models.Song;

import java.util.ArrayList;
import java.util.List;

public class FavoriteAdapter extends RecyclerView.Adapter<FavoriteAdapter.FavoriteViewHolder> {

    public interface OnFavoriteItemClickListener {
        void onPlaySong(Song song, int position);
        void onRemoveFavorite(Favorite favorite, int position);
    }

    private final List<Favorite> favorites = new ArrayList<>();
    private final OnFavoriteItemClickListener listener;

    public FavoriteAdapter(OnFavoriteItemClickListener listener) {
        this.listener = listener;
    }

    public void setFavorites(List<Favorite> newFavorites) {
        favorites.clear();
        if (newFavorites != null) {
            favorites.addAll(newFavorites);
        }
        notifyDataSetChanged();
    }

    public void removeAt(int position) {
        if (position >= 0 && position < favorites.size()) {
            favorites.remove(position);
            notifyItemRemoved(position);
            notifyItemRangeChanged(position, favorites.size());
        }
    }

    public List<Favorite> getFavorites() {
        return favorites;
    }

    public List<Song> getSongList() {
        List<Song> songs = new ArrayList<>();
        for (Favorite fav : favorites) {
            if (fav.getSong() != null) {
                songs.add(fav.getSong());
            }
        }
        return songs;
    }

    @NonNull
    @Override
    public FavoriteViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_favorite, parent, false);
        return new FavoriteViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull FavoriteViewHolder holder, int position) {
        Favorite fav = favorites.get(position);
        Song song = fav.getSong();

        if (song == null) {
            holder.tvFavTitle.setText("Unavailable track");
            return;
        }

        holder.tvFavTitle.setText(song.getTitle());
        holder.tvFavArtist.setText(String.format("%s • %s", song.getArtist(), song.getCategory()));
        holder.tvFavDuration.setText(song.getFormattedDuration());
        holder.tvFavBadge8D.setVisibility(song.is8D() ? View.VISIBLE : View.GONE);

        String resolvedImage = ApiClient.resolveMediaUrl(song.getImageUrl());
        if (!resolvedImage.isEmpty()) {
            Glide.with(holder.itemView.getContext())
                    .load(resolvedImage)
                    .placeholder(R.drawable.ic_music_note)
                    .error(R.drawable.ic_music_note)
                    .apply(RequestOptions.bitmapTransform(new RoundedCorners(14)))
                    .into(holder.ivFavCover);
        } else {
            holder.ivFavCover.setImageResource(R.drawable.ic_music_note);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onPlaySong(song, holder.getAdapterPosition());
            }
        });

        holder.btnRemoveFav.setOnClickListener(v -> {
            if (listener != null) {
                listener.onRemoveFavorite(fav, holder.getAdapterPosition());
            }
        });
    }

    @Override
    public int getItemCount() {
        return favorites.size();
    }

    static class FavoriteViewHolder extends RecyclerView.ViewHolder {
        final ImageView ivFavCover;
        final TextView tvFavTitle;
        final TextView tvFavArtist;
        final TextView tvFavBadge8D;
        final TextView tvFavDuration;
        final View btnRemoveFav;

        FavoriteViewHolder(@NonNull View itemView) {
            super(itemView);
            ivFavCover = itemView.findViewById(R.id.ivFavCover);
            tvFavTitle = itemView.findViewById(R.id.tvFavTitle);
            tvFavArtist = itemView.findViewById(R.id.tvFavArtist);
            tvFavBadge8D = itemView.findViewById(R.id.tvFavBadge8D);
            tvFavDuration = itemView.findViewById(R.id.tvFavDuration);
            btnRemoveFav = itemView.findViewById(R.id.btnRemoveFav);
        }
    }
}
