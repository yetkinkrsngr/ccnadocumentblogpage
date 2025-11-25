using CcnaBlog.Api.DTOs;
using FluentValidation;

namespace CcnaBlog.Api.Validators
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("E-posta adresi gereklidir.")
                .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre gereklidir.")
                .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.");

            RuleFor(x => x.DisplayName)
                .NotEmpty().WithMessage("Görünen isim gereklidir.")
                .MaximumLength(50).WithMessage("Görünen isim en fazla 50 karakter olabilir.");
        }
    }

    public class LoginEmailRequestValidator : AbstractValidator<LoginEmailRequestDto>
    {
        public LoginEmailRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("E-posta adresi gereklidir.")
                .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre gereklidir.");
        }
    }
}
