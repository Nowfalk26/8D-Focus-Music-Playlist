package com.example.focusmusic.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.focusmusic.R;
import com.example.focusmusic.models.Playlist;

import java.util.ArrayList;
import java.util.List;

public class PlaylistAdapter extends RecyclerView.Adapter<PlaylistAdapter.PlaylistViewHolder> {

    public interface OnPlaylistClickListener {
        void onPlaylistClick(Playlist playlist);
        void onDeletePlaylist(Playlist playlist, int position);
    }

    private final List<Playlist> playlists = new ArrayList<>();
    private final OnPlaylistClickListener listener;

    public PlaylistAdapter(OnPlaylistClickListener listener) {
        this.listener = listener;
    }

    public void setPlaylists(List<Playlist> newPlaylists) {
        playlists.clear();
        if (newPlaylists != null) {
            playlists.addAll(newPlaylists);
        }
        notifyDataSetChanged();
    }

    public void removeAt(int position) {
        if (position >= 0 && position < playlists.size()) {
            playlists.remove(position);
            notifyItemRemoved(position);
            notifyItemRangeChanged(position, playlists.size());
        }
    }

    @NonNull
    @Override
    public PlaylistViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_playlist, parent, false);
        return new PlaylistViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull PlaylistViewHolder holder, int position) {
        Playlist playlist = playlists.get(position);

        holder.tvPlaylistName.setText(playlist.getName());

        if (playlist.getDescription() != null && !playlist.getDescription().trim().isEmpty()) {
            holder.tvPlaylistDesc.setText(playlist.getDescription());
            holder.tvPlaylistDesc.setVisibility(View.VISIBLE);
        } else {
            holder.tvPlaylistDesc.setVisibility(View.GONE);
        }

        int count = playlist.getSongCount();
        holder.tvPlaylistTrackCount.setText(count + (count == 1 ? " Track" : " Tracks"));

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onPlaylistClick(playlist);
            }
        });

        holder.btnDeletePlaylist.setOnClickListener(v -> {
            if (listener != null) {
                listener.onDeletePlaylist(playlist, holder.getAdapterPosition());
            }
        });
    }

    @Override
    public int getItemCount() {
        return playlists.size();
    }

    static class PlaylistViewHolder extends RecyclerView.ViewHolder {
        final TextView tvPlaylistName;
        final TextView tvPlaylistDesc;
        final TextView tvPlaylistTrackCount;
        final View btnDeletePlaylist;

        PlaylistViewHolder(@NonNull View itemView) {
            super(itemView);
            tvPlaylistName = itemView.findViewById(R.id.tvPlaylistName);
            tvPlaylistDesc = itemView.findViewById(R.id.tvPlaylistDesc);
            tvPlaylistTrackCount = itemView.findViewById(R.id.tvPlaylistTrackCount);
            btnDeletePlaylist = itemView.findViewById(R.id.btnDeletePlaylist);
        }
    }
}
