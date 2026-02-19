let eventBus = new Vue();
Vue.component('product-review', {
    template: `

<form class="review-form" @submit.prevent="onSubmit">

<p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>
</p>

 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name">
 </p>

 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review"></textarea>
 </p>

 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
 </p>
<p>
    <label>Would you recommend this product?</label>
    <div class="recommend-container">
        <label class="radio-label">
            <input type="radio" value="Yes" v-model="recommended"> Yes
        </label>
        <label class="radio-label">
            <input type="radio" value="No" v-model="recommended"> No
        </label>
    </div>
</p>


 <p>
   <input type="submit" value="Submit"> 
 </p>

</form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommended: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors= [];
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommended: this.recommended
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommended = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.recommended) this.errors.push("Recommended required.")
            }
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        premium: {
            type: Boolean,
            required: true
        },
        details: {
            type: Array,
            required: true
        },
        product: {
            type: String,
            required: true
        },
        brand: {
            type: String,
            required: true
        },
        variants: {
            type: Array,
            required: true
        }
    },
    template: `
    <div class="product-tabs">   
        <ul class="tab-container">
            <span class="tab"
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
            >{{ tab }}</span>
        </ul>
        <div v-show="selectedTab === 'Reviews'" class="tab-content">
            <h3>Customer Reviews</h3>
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="review in reviews" class="review-item">
                    <p><strong>Name: {{ review.name }}</strong></p>
                    <p>Rating: {{ review.rating }}/5</p>
                    <p>Review: {{ review.review }}</p>
                    <p>Recommend: {{ review.recommended}}</p>
                </li>
            </ul>
        </div>
        <div v-show="selectedTab === 'Make a Review'" class="tab-content">
            <h3>Write a Review</h3>
            <product-review></product-review>
        </div>
        <div v-show="selectedTab === 'Shipping'" class="tab-content">
            <h3>Shipping Information</h3>
            <div class="shipping-info">
                <p>Delivery: </p>
                <ul>
                    <li>Usually Shipping - {{ shippingCost }}</li>
                    <li>Fast Shipping - 5$</li>
                </ul>
            </div>
        </div>
        <div v-show="selectedTab === 'Details'" class="tab-content">
            <h3>Product Details</h3>
            <div class="product-details">
                <p><strong>Product:</strong> {{ product }}</p>
                <p><strong>Brand:</strong> {{ brand }}</p>
                <p><strong>Materials:</strong></p>
                <ul>
                    <li v-for="detail in details">{{ detail }}</li>
                </ul>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    },
    computed: {
        shippingCost() {
            return this.premium ? "Free" : "$2.99";
        },
    }
});


Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class="product">
    <div class="product-image">
           <img :src="image" :alt="altText"/>
       </div>

       <div class="product-info">
           <h1>{{ title }}</h1>
           <p>{{description}}</p>
           <span v-if="onSale">On sale</span>
           <span v-else></span><br>
           <a  v-bind:href="link">More products like this</a>
           <p v-if="inStock">In stock</p>
           <p v-else :class="{'line-through': !inStock}">Out of Stock</p>
           <p>{{sale}}</p>
           <ul>
               <li v-for="detail in details">{{ detail }}</li>
           </ul>
           <p>Shipping: {{ shipping }}</p>
           <div
                   class="color-box"
                   v-for="(variant, index) in variants"
                   :key="variant.variantId"
                   :style="{ backgroundColor:variant.variantColor }"
                   @mouseover="updateProduct(index)"
           ></div>
           
           <ul>
                <li v-for="size in sizes">{{ size }}</li>
           </ul>
          

           <button
                   v-on:click="addToCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Add to cart
           </button>
           <button v-on:click="removeFromCart" :disabled="!inStock" :class="{disabledButton: !inStock}">Remove cart</button>
           
       </div>
       <div>
       <product-tabs 
            :reviews="reviews"
            :premium="premium"
            :details="details"
            :product="product"
            :brand="brand"
            :variants="variants">
       </product-tabs>
   </div>
 `,
    data() {
        return {
            product: "Socks",
            description: "A pair of warm, fuzzy socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks.",
            onSale: true,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        addReview(productReview) {
            this.reviews.push(productReview)
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            if (this.onSale) {
                return this.brand + '  ' + this.product + ' Распродажа';
            }
            return this.brand + ' ' + this.product + ' Без распродажи';
        },
        shipping() {
            if (this.premium) {
                return "free";
            } else {
                return 2.99
            }
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        });
    }
})
let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        removeFromCart(id) {
            let index = this.cart.indexOf(id);
            if (index !== -1) {
                this.cart.splice(index, 1);
            }
        }
    },
})