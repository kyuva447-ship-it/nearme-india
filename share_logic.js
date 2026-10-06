const handleShare = async (seller) => {
    const shareData = {
      title: seller.shopName,
      text: `Check out ${seller.shopName} on NearMe India! Located in ${seller.city}. They are a top-rated ${seller.category} provider.`,
      url: `https://nearme-india.org/?shop=${seller.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert("Link copied to clipboard! You can now paste it in WhatsApp or Facebook.");
    }
  };
