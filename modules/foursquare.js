class FoursquareAPI {
    constructor(config) {
      this.api_key = config.api_key
      this.basePath = "https://dev.to/api",
      // A random coordinate to use between calls imitating regular behavior
      this.baseLocation = '26.30' + between(340000000000,499999999999) + ',50.1' + between(2870000000000,3119999999999);
    }

    check_in(location_id) {

    }

    between(min, max) {  
        return Math.floor(
          Math.random() * (max - min) + min
        )
    }
      
      
    promo_check_in_nine_oclockers(){

    }
    promo_check_in_twelve_oclockers(){

    }
    promo_check_in_fourthirty_oclockers(){

    }
    promoe_autolike(){

    }
    auto_like(){

    }
  }
  