let eventBus = new Vue()

Vue.component('product-info', {
    template: `
    <div>
        <ul>    
            <span class="tab" :class="{ activeTab: selectedTab === tab }" v-for="(tab, index) in tabs" @click="selectedTab = tab">{{ tab }}</span>
        </ul>
        <div v-show="selectedTab === 'Shipping'">
            <p>Shipping: {{ shipping }}</p>
        </div>
        <div v-show="selectedTab === 'Details'">
            <product-details :details="details"></product-details>
        </div>
    </div>
    `,
    data() {
        return {
            tabs: ['Shipping', 'Details'],
            selectedTab: 'Shipping'
        }
    },
    props: {
        details: {
            type: Array,
            required: true
        },
        shipping: {
            required: true
        }
    }
})


Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        },
        cart: {
            type: Array,
            required: true

        }

    },
    template: `
    <div class="product">
        <div class="product-image">
            <img :alt="altText" :src="image">
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
            <a :href="link">More products like this.</a>
            <p v-if="inventory > 10, inStock">In Stock</p>
            <p v-else-if="inventory <= 10 && inventory > 0, inStock">Almost sold out!</p>
            <p v-else
               :class="{OutOfStock: !inStock}"
            >
                Out of Stock
            </p>
            <span v-show="onSale">On Sale!</span>

            <div class="color-box"
                 v-for="(variant, index) in variants"
                 :key="variant.variantId"
                 :style="{ backgroundColor:variant.variantColor }"
                 @mouseover="updateProduct(index)">
            </div>
            <ul>
                <li v-for="size in sizes">{{size}}</li>
            </ul>
            
            <button
                    v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
            >
                Add to cart
            </button>
            <button 
            v-on:click="deleteOnCart"
            v-if="cart != 0">
            Delete on cart
            </button>
             <product-info :shipping="shipping" :details="details"></product-info>
            <product-tabs :reviews="reviews"></product-tabs>
        </div>
    </div>
 `,
    data() {
        return {
            product: "Socks",
            brand: "Vue Mastery",
            description: "A pair of warm, fuzzy socks.",
            selectedVariant: 0,
            altText: "A pair jf socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            inventory: 100,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    variantSale: true,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0,
                    variantSale: false,
                }
            ],

            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart',
                this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        deleteOnCart() {
            this.$emit('delete-on-cart');
        },

    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },
        onSale() {
            return this.variants[this.selectedVariant].variantSale;
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return "2.99$"
            }
        }

    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }

})

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
            <label for="recommend">Would you recommend this product?</label><br>
            <label for="recommend"><input type="radio" id="recommend" v-model="recommend" value="Yes">Yes</label>
            <label for="recommend"><input type="radio" id="recommend" v-model="recommend" value="No">No</label>
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
            errors: [],
            recommend: null
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.recommend) this.errors.push("Recommend required.")
            }
        }
    }


})

Vue.component('product-details', {
        template: `
    <ul>
        <li v-for="detail in details">{{detail}}</li>
    </ul>
    `,
        props: {
            details: {
                type: Array,
                required: true
            }
        }
    }
)

Vue.component('product-tabs', {
    template: `
     <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <button @click="toggleSortOrder">Sort by Rating</button>
         <ul>
           <li v-for="review in sortedReviews">
           <p>{{ review.name }}</p>
           <p>Rating: {{ review.rating }}</p>
           <p>{{ review.review }}</p>
           <p>Recommends: {{ review.recommend }}</p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
     </div>
`,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews',
            sortAscending: false
        }
    },
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    computed: {
        sortedReviews() {
            return this.reviews.slice().sort((a, b) => {
                return this.sortAscending ? a.rating - b.rating : b.rating - a.rating;
            });
        }
    },
    methods: {
        toggleSortOrder() {
            this.sortAscending = !this.sortAscending;
        }
    }
})



let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        deleteCart(id) {
            this.cart.splice(-1, 1);
        }
    }

})