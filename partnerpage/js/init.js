$(window).load(function () {
	"use strict";
	$('#status').fadeOut();
	$('#preloader').delay(350).fadeOut('slow');
	$('body').delay(350).css({
		'overflow': 'visible'
	});
});
$(function () {
	"use strict";

	/* ---------------------------------------------------------
	 * Background (Video)
	 */
	
	 if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Windows Phone|Opera Mini/i.test(navigator.userAgent) ) {
		$.backstretch([
			"Demoreel2013.jpg"
		]);
	}
	else {
		$("body").vide({
		    mp4: 'Demoreel2013.mp4',
		}); 
		$("video").parent().css("position", "fixed");
	}
	
	/* ---------------------------------------------------------
	 * WOW
	 */
	
	new WOW({
		 mobile: false,
	}).init();
	
	
	/* ---------------------------------------------------------
	 * Team carousel
	 */
	
	$("#teamCarousel").owlCarousel({
		items: 4,
		itemsTablet: [768,3],
		itemsTabletSmall: [690,2],
		itemsMobile : [480,1]
	});
	
	/* ---------------------------------------------------------
	 * Scroll arrow
	 */
	
	$("#scroll").click(function () {
	 	if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
	 		var target = $(this.hash);
	 		target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
	 		if (target.length) {
	 			$('html,body').animate({
	 				scrollTop: target.offset().top
	 			}, 1200);
	 			return false;
	 		}
	 	}
	 });
	 
	/* ---------------------------------------------------------
	 * In page link
	 */
	
	$("#scroll2").click(function () {
	 	if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
	 		var target = $(this.hash);
	 		target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
	 		if (target.length) {
	 			$('html,body').animate({
	 				scrollTop: target.offset().top
	 			}, 1200);
	 			return false;
	 		}
	 	}
	 });

	/* ---------------------------------------------------------
	 * Countdown
	 */

	var description = {
		weeks: "weeks",
		days: "days",
		hours: "hours",
		minutes: "minutes",
		seconds: "seconds"
	};
	
	// year/month/day
	$('#countdown').countdown('2016/5/15', function (event) {
		$(this).html(event.strftime(
			'<div class="countdown-section"><b>%w</b> <span>' + description.weeks + '</span> </div>' +
			'<div class="countdown-section"><b>%d</b> <span>' + description.days + '</span> </div>' +
			'<div class="countdown-section"><b>%H</b> <span>' + description.hours + '</span> </div>' +
			'<div class="countdown-section"><b>%M</b> <span>' + description.minutes + '</span> </div>' +
			'<div class="countdown-section"><b>%S</b> <span>' + description.seconds + '</span> </div>'
		));
	});


	/* ---------------------------------------------------------
	 * Form validation
	 */

	/* Signup form */

	$('#signupForm').bootstrapValidator({
		message: 'This value is not valid',
		feedbackIcons: {
			valid: 'fa fa-check',
			invalid: 'fa fa-times',
			validating: 'fa fa-refresh'
		},
		submitHandler: function (validator, form, submitButton) {
			var l = Ladda.create(submitButton[0]),
				btnText = submitButton.children(".ladda-label");
			
			l.start();
			btnText.html("Signing up...");
			var input = {
       		 email: $("[name='email']", form).val(),
     		 };

			
		  lambda.invoke({
			FunctionName: 'LambdAuthCreateEmail',
			Payload: JSON.stringify(input)
		  }, function(err, data) {
			if (err) console.log(err, err.stack);
			else {
			  var output = JSON.parse(data.Payload);
			  if (!output.login) {
								btnText.html('Something went wrong');							
			  } else {
				btnText.html('We will notify you. Thanks');
				var creds = AWS.config.credentials;
				creds.params.IdentityId = output.identityId;
				creds.params.Logins = {
				  'cognito-identity.amazonaws.com': output.token
				};
			creds.expired = true;
			l.stop(); 
			validator.disableSubmitButtons(true);

			// Do something with the authenticated role
			  }
			}
		  });
		},
		fields: {
			email: {
				validators: {
					notEmpty: {
						message: 'Email cannot be empty'
					},
					emailAddress: {
						message: 'The input is not a valid email address'
					}
				}
			}
		}
	});

	/* Contact form */

	$('#contactForm').bootstrapValidator({
		fields: {
			name: {
				validators: {
					notEmpty: {
						message: 'Name cannot be empty'
					},
					stringLength: {
						min: 6,
						max: 30,
						message: 'Name must be more than 6 and less than 30 characters long'
					},
					regexp: {
						regexp: /^[a-zA-Z\s]+$/,
						message: 'Name can only consist alphabetical characters'
					}
				}
			},
			contactEmail: {
				validators: {
					notEmpty: {
						message: 'Email cannot be empty'
					},
					emailAddress: {
						message: 'The input is not a valid email address'
					}
				}
			},
			message: {
				validators: {
					notEmpty: {
						message: 'Message cannot be empty'
					}
				}
			}
		},
		feedbackIcons: {
			valid: 'fa fa-check',
			invalid: 'fa fa-times',
			validating: 'fa fa-refresh'
		},
		submitHandler: function (validator, form, submitButton) {
			var l = Ladda.create(submitButton[0]),
				btnText = submitButton.children(".ladda-label");
			
			l.start();
			btnText.html("Sending...");
			
			var input = {
       		 name: $("[name='name']", form).val(),
       		 email: $("[name='contactEmail']", form).val(),
       		 message: $("[name='message']", form).val(),
     		 };

			
		  lambda.invoke({
			FunctionName: 'LambdAuthMessage',
			Payload: JSON.stringify(input)
		  }, function(err, data) {
			if (err) console.log(err, err.stack);
			else {
			  var output = JSON.parse(data.Payload);
			  if (!output.created) {
								btnText.html('Error!');	
						
			  } else {
				btnText.html('Sent!');
				var creds = AWS.config.credentials;
				creds.params.IdentityId = output.identityId;
				creds.params.Logins = {
				  'cognito-identity.amazonaws.com': output.token
				};
			l.stop(); 
			validator.disableSubmitButtons(true);

			// Do something with the authenticated role
			  }
			}
		  });
		},
	});
});