package com.example.focusmusic.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.focusmusic.R;
import com.example.focusmusic.models.Category;

import java.util.ArrayList;
import java.util.List;

public class CategoryAdapter extends RecyclerView.Adapter<CategoryAdapter.CategoryViewHolder> {

    public interface OnCategoryClickListener {
        void onCategorySelected(Category category);
        void onCategoryLongClick(Category category);
    }

    private final List<Category> categories = new ArrayList<>();
    private final OnCategoryClickListener listener;
    private int selectedPosition = 0;

    public CategoryAdapter(OnCategoryClickListener listener) {
        this.listener = listener;
    }

    public void setCategories(List<Category> newCategories) {
        categories.clear();
        // Add default "All" category option
        Category allCategory = new Category("all", "All", "All Focus Soundscapes", "");
        categories.add(allCategory);

        if (newCategories != null) {
            categories.addAll(newCategories);
        }
        selectedPosition = 0;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public CategoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_category, parent, false);
        return new CategoryViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CategoryViewHolder holder, int position) {
        Category category = categories.get(position);
        holder.tvCategoryName.setText(category.getName());

        boolean isSelected = position == selectedPosition;
        holder.itemView.setBackgroundResource(
                isSelected ? R.drawable.bg_chip_selected : R.drawable.bg_chip_unselected
        );

        holder.itemView.setOnClickListener(v -> {
            int previousPosition = selectedPosition;
            selectedPosition = holder.getAdapterPosition();
            notifyItemChanged(previousPosition);
            notifyItemChanged(selectedPosition);

            if (listener != null) {
                listener.onCategorySelected(category);
            }
        });

        holder.itemView.setOnLongClickListener(v -> {
            if (listener != null) {
                listener.onCategoryLongClick(category);
                return true;
            }
            return false;
        });
    }

    @Override
    public int getItemCount() {
        return categories.size();
    }

    static class CategoryViewHolder extends RecyclerView.ViewHolder {
        final TextView tvCategoryName;

        CategoryViewHolder(@NonNull View itemView) {
            super(itemView);
            tvCategoryName = itemView.findViewById(R.id.tvCategoryName);
        }
    }
}
