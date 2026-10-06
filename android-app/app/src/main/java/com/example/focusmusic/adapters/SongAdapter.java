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
import com.example.focusmusic.models.Song;

import java.util.ArrayList;
import java.util.List;

public class SongAdapter extends RecyclerView.Adapter<SongAdapter.SongViewHolder> {

    public interface OnSongClickListener {
        void onSongClick(Song song, int position);
    }

    private final List<Song> songs = new ArrayList<>();
    private final OnSongClickListener listener;

    public SongAdapter(OnSongClickListener listener) {
        this.listener = listener;
    }

    public void setSongs(List<Song> newSongs) {
        songs.clear();
        if (newSongs != null) {
            songs.addAll(newSongs);
        }
        notifyDataSetChanged();
    }

    public List<Song> getSongs() {
        return songs;
    }

    @NonNull
    @Override
    public SongViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_song, parent, false);
        return new SongViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SongViewHolder holder, int position) {
        Song song = songs.get(position);

        holder.tvSongTitle.setText(song.getTitle());
        holder.tvSongArtist.setText(String.format("%s • %s", song.getArtist(), song.getCategory()));
        holder.tvDuration.setText(song.getFormattedDuration());

        // 8D Badge visibility
        holder.tvBadge8D.setVisibility(song.is8D() ? View.VISIBLE : View.GONE);

        // Load album cover via Glide
        String resolvedImageUrl = ApiClient.resolveMediaUrl(song.getImageUrl());
        if (!resolvedImageUrl.isEmpty()) {
            Glide.with(holder.itemView.getContext())
                    .load(resolvedImageUrl)
                    .placeholder(R.drawable.ic_music_note)
                    .error(R.drawable.ic_music_note)
                    .apply(RequestOptions.bitmapTransform(new RoundedCorners(14)))
                    .into(holder.ivSongCover);
        } else {
            holder.ivSongCover.setImageResource(R.drawable.ic_music_note);
        }

        // Entire item click
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onSongClick(song, holder.getAdapterPosition());
            }
        });

        // Play action container click
        holder.ivPlayAction.setOnClickListener(v -> {
            if (listener != null) {
                listener.onSongClick(song, holder.getAdapterPosition());
            }
        });
    }

    @Override
    public int getItemCount() {
        return songs.size();
    }

    static class SongViewHolder extends RecyclerView.ViewHolder {
        final ImageView ivSongCover;
        final TextView tvSongTitle;
        final TextView tvSongArtist;
        final TextView tvBadge8D;
        final TextView tvDuration;
        final View ivPlayAction;

        SongViewHolder(@NonNull View itemView) {
            super(itemView);
            ivSongCover = itemView.findViewById(R.id.ivSongCover);
            tvSongTitle = itemView.findViewById(R.id.tvSongTitle);
            tvSongArtist = itemView.findViewById(R.id.tvSongArtist);
            tvBadge8D = itemView.findViewById(R.id.tvBadge8D);
            tvDuration = itemView.findViewById(R.id.tvDuration);
            ivPlayAction = itemView.findViewById(R.id.ivPlayAction);
        }
    }
}
