$(document).ready(function () {
  $("#delete").confirm({
    title: "Are you sure you want to delete this restaurant?",
    content: "You created this restaurant!",
    buttons: {
      yes: function () {
        //location.href = this.$target.attr('http://twitter.com/craftpip');
        const path = window.location.pathname.split("/");
        const id = path[path.length - 1];
        console.log(id);
        $.ajax({
          method: "DELETE",
          url: `/api/restaurants/${path[path.length - 1]}`,
          success: function (result) {
            console.log(`delete success ${JSON.stringify(result)}`);
            $.confirm({
              title: "Success",
              content: `You deleted ${result.deleted} !`,
              buttons: {
                Okay: function () {
                  location.href = "/api/restaurants ";
                },
              },
            });
          },
        });
      },
      "No, go back": function () {},
    },
  });

  $("#edit").confirm({
    title: "Prompt!",
    content:
      "" +
      '<form action="" class="formName">' +
      '<div class="form-group">' +
      "<label>Enter restaurant title here</label>" +
      '<input type="text" placeholder="Restaurant name" class="name form-control" required />' +
      "</div>" +
      "</form>",
    buttons: {
      formSubmit: {
        text: "Submit",
        btnClass: "btn-blue",
        action: function () {
          var name = this.$content.find(".name").val();
          if (!name) {
            $.alert("provide a valid name");
            return false;
          } else {
            const path = window.location.pathname.split("/");
            const id = path[path.length - 1];
            $.ajax({
              method: "PUT",
              url: `/api/restaurants/${path[path.length - 1]}`,
              dataType: 'json',
              data: JSON.stringify({
                newRestaurantName: name,
              }),
              success: function (result) {
                console.log(`update success ${JSON.stringify(result)}`);
                $.confirm({
                  title: "Success",
                  content: `Restaurant updated!`,
                  buttons: {
                    Okay: function () {
                      location.href = `/api/restaurants/${
                        path[path.length - 1]
                      }`;
                    },
                  },
                });
              },
              error: function (xhr) {
                console(xhr);
              },
            });
          }
        },
      },
      cancel: function () {
        //close
      },
    },
    onContentReady: function () {
      // bind to events
      var jc = this;
      this.$content.find("form").on("submit", function (e) {
        // if the user submits the form by pressing enter in the field.
        e.preventDefault();
        jc.$$formSubmit.trigger("click"); // reference the button and click it
      });
    },
  });


  
  // $('#restaurant_table td').click(function() {
  //   alert("HTML: " +$(this).html());
    
  // });
});
