import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Search,
  Filter,
  Calendar,
  X,
  ChevronRight,
  Apple,
  AlertCircle,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/src/i18n/context/LanguageContext";
import { useTheme } from "@/src/context/ThemeContext";
import { api } from "@/src/services/api";
import { ToastService } from "@/src/services/totastService";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  saturated_fat?: number;
  trans_fat?: number;
  cholesterol?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitamin_c?: number;
  vitamin_d?: number;
}

interface ScannedProduct {
  id: string;
  barcode?: string;
  name: string;
  brand?: string;
  category: string;
  nutrition_per_100g: NutritionData;
  ingredients: string[];
  allergens: string[];
  labels: string[];
  health_score?: number;
  image_url?: string;
  serving_size?: string;
  servings_per_container?: number;
  created_at: string;
  scan_type: string;
  product_name?: string;
}

interface ScannedProductsGalleryProps {
  visible: boolean;
  onClose: () => void;
}

export default function ScannedProductsGallery({
  visible,
  onClose,
}: ScannedProductsGalleryProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { colors, isDark } = useTheme();
  const isRTL = language === "he";

  const [products, setProducts] = useState<ScannedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ScannedProduct[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ScannedProduct | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/food-scanner/history");
      if (response.data.success && response.data.data) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      ToastService.handleError(error, "Load Products");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  };

  const getCategories = () => {
    const categories = new Set(
      products.map((p) => p.category).filter(Boolean)
    );
    return ["all", ...Array.from(categories)];
  };

  const getHealthScoreColor = (score?: number) => {
    if (!score) return colors.textSecondary;
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    if (score >= 40) return "#EF4444";
    return "#DC2626";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "he" ? "he-IL" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderProductCard = (product: ScannedProduct) => (
    <TouchableOpacity
      key={product.id}
      style={[styles.productCard, { backgroundColor: colors.surface }]}
      onPress={() => setSelectedProduct(product)}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: product.image_url || "https://via.placeholder.com/80",
        }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text
          style={[styles.productName, { color: colors.text }]}
          numberOfLines={1}
        >
          {product.name || product.product_name}
        </Text>
        {product.brand && (
          <Text
            style={[styles.productBrand, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {product.brand}
          </Text>
        )}
        <View style={styles.productMeta}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.primaryContainer },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: colors.onPrimaryContainer },
              ]}
            >
              {product.category}
            </Text>
          </View>
          {product.health_score && (
            <View style={styles.healthScore}>
              <View
                style={[
                  styles.healthScoreDot,
                  { backgroundColor: getHealthScoreColor(product.health_score) },
                ]}
              />
              <Text
                style={[
                  styles.healthScoreText,
                  { color: getHealthScoreColor(product.health_score) },
                ]}
              >
                {product.health_score}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.productDate, { color: colors.textTertiary }]}>
          <Calendar size={12} color={colors.textTertiary} />{" "}
          {formatDate(product.created_at)}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedProduct) return null;

    return (
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setSelectedProduct(null)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Product Details
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailHeader}>
              <Image
                source={{
                  uri:
                    selectedProduct.image_url ||
                    "https://via.placeholder.com/120",
                }}
                style={styles.detailImage}
              />
              <View style={styles.detailInfo}>
                <Text style={[styles.detailName, { color: colors.text }]}>
                  {selectedProduct.name || selectedProduct.product_name}
                </Text>
                {selectedProduct.brand && (
                  <Text
                    style={[styles.detailBrand, { color: colors.textSecondary }]}
                  >
                    {selectedProduct.brand}
                  </Text>
                )}
                {selectedProduct.barcode && (
                  <Text
                    style={[
                      styles.detailBarcode,
                      { color: colors.textTertiary },
                    ]}
                  >
                    Barcode: {selectedProduct.barcode}
                  </Text>
                )}
              </View>
            </View>

            <View style={[styles.detailSection, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                Nutrition per 100g
              </Text>
              <View style={styles.nutritionGrid}>
                {Object.entries(selectedProduct.nutrition_per_100g).map(
                  ([key, value]) => (
                    <View
                      key={key}
                      style={[
                        styles.nutritionItem,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <Text
                        style={[
                          styles.nutritionLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {key.replace(/_/g, " ").toUpperCase()}
                      </Text>
                      <Text
                        style={[styles.nutritionValue, { color: colors.text }]}
                      >
                        {typeof value === "number" ? value.toFixed(1) : value}
                        {["calories"].includes(key) ? " kcal" : "g"}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>

            {selectedProduct.ingredients.length > 0 && (
              <View style={[styles.detailSection, { backgroundColor: colors.surfaceVariant }]}>
                <Text
                  style={[styles.detailSectionTitle, { color: colors.text }]}
                >
                  Ingredients
                </Text>
                <View style={styles.ingredientsList}>
                  {selectedProduct.ingredients.map((ingredient, index) => (
                    <View
                      key={index}
                      style={[
                        styles.ingredientChip,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <Text
                        style={[
                          styles.ingredientText,
                          { color: colors.text },
                        ]}
                      >
                        {ingredient}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {selectedProduct.allergens.length > 0 && (
              <View style={[styles.detailSection, { backgroundColor: colors.surfaceVariant }]}>
                <Text
                  style={[styles.detailSectionTitle, { color: colors.text }]}
                >
                  <AlertCircle size={16} color={colors.error} /> Allergens
                </Text>
                <View style={styles.allergensList}>
                  {selectedProduct.allergens.map((allergen, index) => (
                    <View
                      key={index}
                      style={[
                        styles.allergenChip,
                        { backgroundColor: colors.error + "20" },
                      ]}
                    >
                      <Text
                        style={[styles.allergenText, { color: colors.error }]}
                      >
                        {allergen}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {selectedProduct.labels.length > 0 && (
              <View style={[styles.detailSection, { backgroundColor: colors.surfaceVariant }]}>
                <Text
                  style={[styles.detailSectionTitle, { color: colors.text }]}
                >
                  Labels
                </Text>
                <View style={styles.labelsList}>
                  {selectedProduct.labels.map((label, index) => (
                    <View
                      key={index}
                      style={[
                        styles.labelChip,
                        { backgroundColor: colors.primaryContainer },
                      ]}
                    >
                      <Text
                        style={[
                          styles.labelText,
                          { color: colors.onPrimaryContainer },
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={isDark ? ["#1e3a5f", "#2c5282"] : ["#3b82f6", "#2563eb"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {t("food_scanner.scanned_products") || "Scanned Products"}
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <Filter size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder={t("common.search") || "Search products..."}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {showFilters && (
            <ScrollView
              horizontal
              style={styles.filtersContainer}
              showsHorizontalScrollIndicator={false}
            >
              {getCategories().map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === category &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {category === "all"
                      ? t("common.all") || "All"
                      : category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </LinearGradient>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t("common.loading") || "Loading products..."}
            </Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Apple size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery || selectedCategory !== "all"
                ? t("food_scanner.no_products_found") || "No products found"
                : t("food_scanner.no_scanned_products") ||
                  "No scanned products yet"}
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textTertiary }]}
            >
              {t("food_scanner.scan_products_hint") ||
                "Start scanning products to see them here"}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.productsContainer}>
            <View style={styles.productsHeader}>
              <Text style={[styles.productsCount, { color: colors.text }]}>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </Text>
            </View>
            {filteredProducts.map(renderProductCard)}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {renderDetailModal()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  searchContainer: {
    marginTop: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  filtersContainer: {
    marginTop: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#FFFFFF",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filterChipTextActive: {
    color: "#10B981",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productsHeader: {
    paddingVertical: 16,
  },
  productsCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
  },
  productBrand: {
    fontSize: 14,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  healthScore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  healthScoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthScoreText: {
    fontSize: 12,
    fontWeight: "600",
  },
  productDate: {
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  detailImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  detailBrand: {
    fontSize: 16,
    marginBottom: 2,
  },
  detailBarcode: {
    fontSize: 14,
    marginTop: 4,
  },
  detailSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nutritionItem: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
  },
  nutritionLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  ingredientsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ingredientChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ingredientText: {
    fontSize: 14,
  },
  allergensList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  allergenChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  allergenText: {
    fontSize: 14,
    fontWeight: "600",
  },
  labelsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  labelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
